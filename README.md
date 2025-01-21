# Kelp Assessment - CSV to JSON Converter API

## Overview

This project implements a CSV to JSON converter API using **NestJS**, **pg**, **TypeORM**, and **Swagger**. The API processes CSV files from a configurable location, converts the data to JSON, and uploads it to a PostgreSQL database. Additionally, it calculates the age distribution of users and outputs a report to the console.

## Features

- **CSV to JSON Conversion**: Parses CSV files into JSON format using custom logic.
- **Database Storage**: Stores mandatory and additional properties in structured and JSONB fields respectively.
- **Age Distribution Report**: Calculates and logs the age distribution of users.
- **Swagger Integration**: API documentation using Swagger.

## Technology Stack

- **Backend**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Documentation**: Swagger
