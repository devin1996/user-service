import { Column, Entity, ObjectIdColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Time{
    
   
    @PrimaryGeneratedColumn()
    admin_id: number;


    @Column({default: "lec"})
    lecture: string;

    @Column({default: "time"})
    time: string;

    @Column({default: "date"})
    date: string;

}

