export type AttrFieldType = 'text' | 'select' | 'number' | 'boolean'

export interface AttrField {
  key: string
  label: string
  type: AttrFieldType
  options?: string[]
  required?: boolean
  placeholder?: string
  unit?: string
}

export interface AttrFilterField {
  key: string
  label: string
  type: 'select' | 'boolean'
  options?: string[]
}

export interface CategoryAttrConfig {
  fields: AttrField[]
  filters: AttrFilterField[]
}

const CAR_MAKES = [
  'Alfa Romeo', 'Audi', 'BMW', 'Citroen', 'Dacia', 'Fiat', 'Ford', 'Honda',
  'Hyundai', 'Jaguar', 'Kia', 'Land Rover', 'Lexus', 'Mazda', 'Mercedes-Benz',
  'Mini', 'Mitsubishi', 'Nissan', 'Peugeot', 'Porsche', 'Renault', 'Seat',
  'Skoda', 'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Vauxhall', 'Volkswagen',
  'Volvo', 'Other',
]

const ATTR_CONFIG: Record<string, CategoryAttrConfig> = {
  'cars-vehicles': {
    fields: [
      { key: 'make', label: 'Make', type: 'select', options: CAR_MAKES, required: true },
      { key: 'model', label: 'Model', type: 'text', placeholder: 'e.g. Corolla, Golf, 3 Series', required: true },
      { key: 'year', label: 'Year', type: 'number', placeholder: 'e.g. 2020' },
      { key: 'mileage', label: 'Mileage', type: 'number', unit: 'miles', placeholder: 'e.g. 45000' },
      { key: 'fuel_type', label: 'Fuel type', type: 'select', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'LPG'] },
      { key: 'transmission', label: 'Transmission', type: 'select', options: ['Manual', 'Automatic', 'Semi-automatic'] },
      { key: 'body_type', label: 'Body type', type: 'select', options: ['Saloon', 'Hatchback', 'SUV / 4x4', 'Estate', 'Coupe', 'Convertible', 'MPV', 'Van', 'Other'] },
      { key: 'colour', label: 'Colour', type: 'text', placeholder: 'e.g. Silver, Black, Red' },
    ],
    filters: [
      { key: 'make', label: 'Make', type: 'select', options: CAR_MAKES },
      { key: 'fuel_type', label: 'Fuel type', type: 'select', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'LPG'] },
      { key: 'transmission', label: 'Transmission', type: 'select', options: ['Manual', 'Automatic', 'Semi-automatic'] },
      { key: 'body_type', label: 'Body type', type: 'select', options: ['Saloon', 'Hatchback', 'SUV / 4x4', 'Estate', 'Coupe', 'Convertible', 'MPV', 'Van', 'Other'] },
    ],
  },

  'property': {
    fields: [
      { key: 'property_type', label: 'Property type', type: 'select', options: ['Flat', 'House', 'Bungalow', 'Terraced', 'Semi-detached', 'Detached', 'Studio', 'Maisonette', 'Other'], required: true },
      { key: 'bedrooms', label: 'Bedrooms', type: 'select', options: ['Studio', '1', '2', '3', '4', '5', '6+'] },
      { key: 'bathrooms', label: 'Bathrooms', type: 'select', options: ['1', '2', '3', '4+'] },
      { key: 'furnished', label: 'Furnished', type: 'boolean' },
      { key: 'parking', label: 'Parking included', type: 'boolean' },
    ],
    filters: [
      { key: 'property_type', label: 'Property type', type: 'select', options: ['Flat', 'House', 'Bungalow', 'Terraced', 'Semi-detached', 'Detached', 'Studio', 'Maisonette', 'Other'] },
      { key: 'bedrooms', label: 'Bedrooms', type: 'select', options: ['Studio', '1', '2', '3', '4', '5', '6+'] },
      { key: 'furnished', label: 'Furnished only', type: 'boolean' },
    ],
  },

  'jobs': {
    fields: [
      { key: 'job_type', label: 'Job type', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Volunteer'], required: true },
      { key: 'employment_type', label: 'Employment type', type: 'select', options: ['Employed', 'Self-employed', 'Freelance'] },
      { key: 'company', label: 'Company name', type: 'text', placeholder: 'e.g. Acme Ltd' },
      { key: 'salary_min', label: 'Salary min', type: 'number', unit: '£/year', placeholder: 'e.g. 25000' },
      { key: 'salary_max', label: 'Salary max', type: 'number', unit: '£/year', placeholder: 'e.g. 35000' },
      { key: 'remote', label: 'Remote / work from home', type: 'boolean' },
    ],
    filters: [
      { key: 'job_type', label: 'Job type', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Volunteer'] },
      { key: 'employment_type', label: 'Employment type', type: 'select', options: ['Employed', 'Self-employed', 'Freelance'] },
      { key: 'remote', label: 'Remote / work from home', type: 'boolean' },
    ],
  },

  'pets': {
    fields: [
      { key: 'species', label: 'Species', type: 'select', options: ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Guinea Pig', 'Hamster', 'Reptile', 'Other'], required: true },
      { key: 'breed', label: 'Breed', type: 'text', placeholder: 'e.g. Labrador, Persian' },
      { key: 'age_months', label: 'Age', type: 'number', unit: 'months', placeholder: 'e.g. 6' },
      { key: 'vaccinated', label: 'Vaccinated', type: 'boolean' },
      { key: 'neutered', label: 'Neutered / spayed', type: 'boolean' },
    ],
    filters: [
      { key: 'species', label: 'Species', type: 'select', options: ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Guinea Pig', 'Hamster', 'Reptile', 'Other'] },
      { key: 'vaccinated', label: 'Vaccinated only', type: 'boolean' },
    ],
  },

  'electronics': {
    fields: [
      { key: 'brand', label: 'Brand', type: 'select', options: ['Apple', 'Samsung', 'Sony', 'LG', 'Philips', 'Panasonic', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Microsoft', 'Google', 'Huawei', 'OnePlus', 'Other'] },
      { key: 'model_name', label: 'Model', type: 'text', placeholder: 'e.g. iPhone 14 Pro, Galaxy S23' },
      { key: 'storage', label: 'Storage', type: 'select', options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB', 'N/A'] },
      { key: 'warranty', label: 'Warranty remaining', type: 'boolean' },
    ],
    filters: [
      { key: 'brand', label: 'Brand', type: 'select', options: ['Apple', 'Samsung', 'Sony', 'LG', 'Philips', 'Panasonic', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Microsoft', 'Google', 'Huawei', 'OnePlus', 'Other'] },
      { key: 'storage', label: 'Storage', type: 'select', options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB', 'N/A'] },
    ],
  },
}

// Maps subcategory slugs → parent category slug for config lookup
const SUBCAT_TO_PARENT: Record<string, string> = {
  'cars': 'cars-vehicles',
  'motorbikes': 'cars-vehicles',
  'vans': 'cars-vehicles',
  'campervans': 'cars-vehicles',
  'parts-accessories': 'cars-vehicles',
  'for-sale': 'property',
  'to-rent': 'property',
  'to-share': 'property',
  'holiday-lets': 'property',
  'commercial': 'property',
  'it-tech': 'jobs',
  'retail': 'jobs',
  'hospitality': 'jobs',
  'driving': 'jobs',
  'healthcare': 'jobs',
  'admin': 'jobs',
  'dogs': 'pets',
  'cats': 'pets',
  'birds': 'pets',
  'fish': 'pets',
  'pet-equipment': 'pets',
  'phones': 'electronics',
  'computers': 'electronics',
  'tvs': 'electronics',
  'cameras': 'electronics',
  'audio': 'electronics',
  'video-games': 'electronics',
}

export function getCategoryAttrConfig(slug: string): CategoryAttrConfig | null {
  return ATTR_CONFIG[slug] ?? ATTR_CONFIG[SUBCAT_TO_PARENT[slug] ?? ''] ?? null
}
