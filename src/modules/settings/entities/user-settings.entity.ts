import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_settings')
export class UserSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ type: 'varchar', length: 20, default: 'light' })
    theme: 'light' | 'dark';

    @Column({ type: 'varchar', length: 10, default: 'en' })
    language: 'en' | 'ur';

    @Column({ type: 'jsonb', default: { email: true, push: false, sms: false } })
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };

    @Column({ name: 'date_format', length: 50, default: 'YYYY-MM-DD' })
    dateFormat: string;

    @Column({ name: 'number_format', length: 50, default: '1,000.00' })
    numberFormat: string;

    @Column({ length: 100, default: 'UTC' })
    timezone: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToOne('User')
    @JoinColumn({ name: 'user_id' })
    user: User;
}
