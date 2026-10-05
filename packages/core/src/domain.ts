/**
 * Domain types shared by web, mobile and the database layer. They mirror the
 * tables in supabase/migrations; keep both in sync.
 */
export type Id = string;
export type IsoDate = string;

export type ProjectStatus = "idea" | "designing" | "building" | "finishing" | "done" | "on_hold";

export interface Project {
  id: Id;
  workspaceId: Id;
  name: string;
  status: ProjectStatus;
  description?: string;
}

export interface Part {
  id: Id;
  projectId: Id;
  name: string;
  /** Millimetres. */
  length: number;
  width: number;
  thickness: number;
  quantity: number;
  materialId?: Id;
}

export type AssetKind = "machine" | "hand_tool" | "power_tool" | "jig";

export interface Asset {
  id: Id;
  workspaceId: Id;
  kind: AssetKind;
  name: string;
  location?: string;
}

/**
 * Someone you lend to or borrow from. Either a registered user (`userId`) or a
 * person without the app whose name you typed in yourself.
 */
export interface Contact {
  id: Id;
  workspaceId: Id;
  name: string;
  userId?: Id;
}

export type LoanDirection = "lent_out" | "borrowed";
export type LoanStatus = "requested" | "active" | "returned" | "cancelled";

export interface Loan {
  id: Id;
  workspaceId: Id;
  assetName: string;
  assetId?: Id;
  contactId: Id;
  direction: LoanDirection;
  status: LoanStatus;
  startsOn: IsoDate;
  dueOn?: IsoDate;
}

/** When a machine can be used, e.g. the school CNC on Tuesdays 18:00 to 21:00. */
export interface AvailabilityWindow {
  id: Id;
  assetId: Id;
  /** 0 = Sunday ... 6 = Saturday. */
  weekday: number;
  startTime: string;
  endTime: string;
  location?: string;
}
