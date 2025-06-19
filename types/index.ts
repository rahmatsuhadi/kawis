// Tabel event
export interface IEvent {
  id: string;                 // UUID, primary key
  title: string;
  description?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  event_date: string;         // ISO 8601 string (timestamptz)
  created_by?: string | null; // UUID pembuat (nullable untuk anon)
  is_anonymous: boolean;
  anonymous_name?: string | null;
  is_approved: boolean;
  created_at: string;         // ISO 8601 timestamp
}

// Tabel post
export interface IPost {
  id: string;                 // UUID, primary key
  event_id: string;           // UUID event terkait (foreign key)
  content: string;            // Konten post
  created_by?: string | null; // UUID pembuat (nullable untuk anon)
  anonymous_name?: string | null;
  created_at: string;         // ISO 8601 timestamp
}

// Tabel event_images
export interface IEventImage {
  id: string;                 // UUID, primary key
  event_id: string;           // UUID event terkait (foreign key)
  image_url: string;          // URL gambar
  created_at: string;         // ISO 8601 timestamp
}
