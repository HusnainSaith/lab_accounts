import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBlacklistedTokens1762602670000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Blacklisted tokens table removed - not needed
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No table to drop
  }
}
