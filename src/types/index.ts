export interface UserProfile {
  id: string
  name: string
  avatar_url: string | null
  bio: string | null
  location: string
  phone: string | null
  reply_rate: number
  avg_reply_hours: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  parent_id: string | null
}

export interface Listing {
  id: string
  user_id: string
  category_id: string
  title: string
  description: string
  price: number | null
  price_type: 'fixed' | 'negotiable' | 'free'
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'parts_only'
  images: string[]
  location: string
  latitude: number | null
  longitude: number | null
  status: 'active' | 'sold' | 'expired' | 'draft'
  offers_shipping: boolean
  is_urgent: boolean
  views_count: number
  created_at: string
  expires_at: string
  user_profiles?: UserProfile
  categories?: Category
}

export interface Conversation {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  created_at: string
  listings?: Listing
  buyer?: UserProfile
  seller?: UserProfile
  messages?: Message[]
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  image_url: string | null
  read_at: string | null
  created_at: string
}

export interface Review {
  id: string
  reviewer_id: string
  reviewee_id: string
  listing_id: string
  overall: number
  communication: number
  reliability: number
  as_described: number
  comment: string | null
  created_at: string
}

export interface SavedSearch {
  id: string
  user_id: string
  query: string
  filters: {
    category?: string
    min_price?: number
    max_price?: number
    location?: string
  }
  email_alerts: boolean
  created_at: string
}

export interface Watchlist {
  id: string
  user_id: string
  listing_id: string
  created_at: string
  listings?: Listing
}
