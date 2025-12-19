import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSentToInvoiceStatus1700000000006 implements MigrationInterface {
  name = 'AddSentToInvoiceStatus1700000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'sent' to the invoice_status enum
    await queryRunner.query(`
      ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'sent';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require recreating the enum type
    console.log('Cannot remove enum value in PostgreSQL. Manual intervention required.');
  }
}