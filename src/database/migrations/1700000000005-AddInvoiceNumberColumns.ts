import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceNumberColumns1700000000005 implements MigrationInterface {
  name = 'AddInvoiceNumberColumns1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing columns to invoices table
    await queryRunner.query(`
      ALTER TABLE invoices 
      ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100),
      ADD COLUMN IF NOT EXISTS invoice_sequence BIGINT,
      ADD COLUMN IF NOT EXISTS supply_date DATE,
      ADD COLUMN IF NOT EXISTS vat_rate NUMERIC(5, 2),
      ADD COLUMN IF NOT EXISTS vat_amount NUMERIC(18, 2),
      ADD COLUMN IF NOT EXISTS exchange_rate_to_aed NUMERIC(18, 6),
      ADD COLUMN IF NOT EXISTS notes_ar TEXT,
      ADD COLUMN IF NOT EXISTS seller_trn VARCHAR(64),
      ADD COLUMN IF NOT EXISTS buyer_trn VARCHAR(64),
      ADD COLUMN IF NOT EXISTS vat_rate_used NUMERIC(5, 2),
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(255),
      ADD COLUMN IF NOT EXISTS pdf_path VARCHAR(500),
      ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
      ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the added columns
    await queryRunner.query(`
      ALTER TABLE invoices 
      DROP COLUMN IF EXISTS invoice_number,
      DROP COLUMN IF EXISTS invoice_sequence,
      DROP COLUMN IF EXISTS supply_date,
      DROP COLUMN IF EXISTS vat_rate,
      DROP COLUMN IF EXISTS vat_amount,
      DROP COLUMN IF EXISTS exchange_rate_to_aed,
      DROP COLUMN IF EXISTS notes_ar,
      DROP COLUMN IF EXISTS seller_trn,
      DROP COLUMN IF EXISTS buyer_trn,
      DROP COLUMN IF EXISTS vat_rate_used,
      DROP COLUMN IF EXISTS payment_method,
      DROP COLUMN IF EXISTS pdf_path,
      DROP COLUMN IF EXISTS qr_code_data,
      DROP COLUMN IF EXISTS paid_at;
    `);
  }
}