import { BadRequestException, Injectable } from '@nestjs/common';
import { UserEntity } from 'db/entities/users.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { createInterface } from 'readline';
import { createReadStream } from 'fs';

@Injectable()
export class UserService {
  private readonly BATCH_SIZE = 1000;
  constructor(
    private readonly dataSource: DataSource,
  ) { }

  async processCsvFromConfig(): Promise<object> {
    const filePath = process.env.CSV_FILE_PATH;
    if (!filePath) {
      throw new BadRequestException('CSV_FILE_PATH is not defined in the environment variables');
    }
    
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const filestream = createReadStream(filePath);
      const rl = createInterface({
        input: filestream,
        crlfDelay: Infinity,
      });

      let headers: string[] = [];
      let isLinefirst = true;
      let batch: Partial<UserEntity>[] = [];

      for await (const line of rl) {
        if (isLinefirst) {
          headers = line.split(',');
          isLinefirst = false;
          continue;
        }

        const values = line.split(',');
        const record = this.mapRecord(headers, values);

        try {
          const user = this.formatUser(record);
          batch.push(user);

          if (batch.length >= this.BATCH_SIZE) {
            await queryRunner.manager.save(UserEntity, batch);
            batch = []; // Reset the batch after insert
          }
        } catch (error) {
          console.error('Skipping invalid record:', record, error);
        }
        // Save user using the transaction
        // await queryRunner.manager.save(UserEntity, user);
      }

      if (batch.length > 0) {
        await queryRunner.manager.save(UserEntity, batch);
      }
      // Commit the transaction after processing all records
      await queryRunner.commitTransaction();

      const ageDistribution = await this.calculateAgeDistribution(queryRunner);
      this.logAgeDistribution(ageDistribution);
      return ageDistribution;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error processing CSV:', error.message);
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  private async calculateAgeDistribution(
    queryRunner: QueryRunner,
  ): Promise<any> {
    const query = `
          SELECT
            CASE
              WHEN age < 20 THEN '< 20'
              WHEN age BETWEEN 20 AND 40 THEN '20 to 40'
              WHEN age BETWEEN 40 AND 60 THEN '40 to 60'
              ELSE '> 60'
            END AS age_group,
            COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users) AS percentage
          FROM users
          GROUP BY age_group;
        `;
    return queryRunner.manager.query(query);
  }

  private mapRecord(
    headers: string[],
    values: string[],
  ): Record<string, string> {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header.trim()] = values[index]?.trim() || null;
    });
    return record;
  }

  private formatUser(record: Record<string, any>): Partial<UserEntity> {
    const {
      'name.firstName': firstName,
      'name.lastName': lastName,
      age,
      ...rest
    } = record;

    // Validate mandatory fields
    if (!firstName || !lastName || !age) {
      throw new Error(`Missing mandatory fields: ${JSON.stringify(record)}`);
    }

    const addressKeys = Object.keys(rest).filter((key) =>
      key.startsWith('address.'),
    );
    const address = addressKeys.reduce((acc, key) => {
      acc[key.replace('address.', '')] = rest[key];
      delete rest[key];
      return acc;
    }, {});

    return {
      name: `${firstName} ${lastName}`,
      age: parseInt(age, 10),
      address: Object.keys(address).length ? address : null,
      additional_info: Object.keys(rest).length ? rest : null,
    };
  }

  private logAgeDistribution(distribution: any[]): void {
    console.log('Age Distribution:');
    distribution.forEach((row) => {
      console.log(`${row.age_group}: ${row.percentage.toFixed(2)}%`);
    });
  }
}
