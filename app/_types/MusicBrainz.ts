export type Artist = {
  id: string;
  name: string;
  'sort-name'?: string;
  disambiguation?: string;
  country?: string;
  type?: string;
  'type-id'?: string;
};

export type ArtistCredit = {
  name: string;
  artist: Artist;
  joinphrase: string;
};

export type TextRepresentation = {
  language: string;
  script: string;
};

export type CoverArtArchive = {
  count: number;
  back: boolean;
  front: boolean;
  artwork: boolean;
  darkened: boolean;
};

export type Area = {
  id: string;
  name: string;
  'sort-name'?: string;
  'iso-3166-1-codes'?: string[];
  type?: string | null;
  'type-id'?: string | null;
  disambiguation?: string;
};

export type ReleaseEvent = {
  date: string;
  area: Area;
};

export type RecordingDetail = {
  id: string;
  title: string;
  length?: number;
  disambiguation?: string;
  video?: boolean;
  'artist-credit'?: ArtistCredit[];
  'first-release-date'?: string;
};

export type Track = {
  id: string;
  position: number;
  number: string;
  title: string;
  length?: number;
  'artist-credit'?: ArtistCredit[];
  recording?: RecordingDetail;
};

export type Media = {
  id: string;
  title: string;
  'track-count': number;
  'format-id': string;
  format: string;
  'track-offset': number;
  position: number;
  tracks?: Track[];
};

export type Label = {
  id: string;
  name: string;
  'sort-name': string;
  type?: string;
  'type-id'?: string;
  disambiguation?: string;
  'label-code'?: number | null;
};

export type LabelInfo = {
  'catalog-number': string;
  label: Label;
};

export type Release = {
  id: string;
  title: string;
  disambiguation: string;
  barcode?: string;
  quality?: string;
  country?: string;
  'artist-credit': ArtistCredit[];
  status?: string;
  'status-id'?: string;
  'text-representation'?: TextRepresentation;
  packaging?: string;
  'packaging-id'?: string;
  date?: string;
  'cover-art-archive'?: CoverArtArchive;
  asin?: string;
  'release-events'?: ReleaseEvent[];
  media?: Media[];
  'cover-art-url'?: string | null;
  'label-info'?: LabelInfo[];
};