export class PayrollPeriod {
  readonly id?: string;
  readonly periodStart: Date;
  readonly periodEnd: Date;
  readonly isLocked: boolean;
  readonly createdBy: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly updatedBy?: string;
  readonly deletedAt?: Date;
  readonly deletedBy?: string;
  readonly isDeleted: boolean;

  constructor(props: {
    id?: string;
    periodStart: Date;
    periodEnd: Date;
    isLocked?: boolean;
    createdBy: string;
    createdAt?: Date;
    updatedAt?: Date;
    updatedBy?: string;
    deletedAt?: Date;
    deletedBy?: string;

    isDeleted?: boolean;
  }) {
    this.id = props.id;
    this.periodStart = props.periodStart;
    this.periodEnd = props.periodEnd;
    this.isLocked = props.isLocked ?? false;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.updatedBy = props.updatedBy;
    this.deletedAt = props.deletedAt;
    this.deletedBy = props.deletedBy;
    this.isDeleted = props.isDeleted ?? false;
  }

  isOverlap(other: PayrollPeriod): boolean {
    return (
      this.periodStart <= other.periodEnd &&
      this.periodEnd >= other.periodStart
    );
  }
}
