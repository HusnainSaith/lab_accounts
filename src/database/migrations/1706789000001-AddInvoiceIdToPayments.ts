import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceIdToPayments1706789000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE payments ADD COLUMN invoice_id UUID REFERENCES invoices(id);`);
        await queryRunner.query(`CREATE INDEX idx_payments_invoice ON payments(invoice_id);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_payments_invoice;`);
        await queryRunner.query(`ALTER TABLE payments DROP COLUMN IF EXISTS invoice_id;`);
    }
}
