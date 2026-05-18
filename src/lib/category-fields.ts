export type AttrFieldType = 'text' | 'number' | 'select'

export interface AttributeField {
  key: string
  label: string
  type: AttrFieldType
  required?: boolean
  options?: string[]
  placeholder?: string
  min?: number
  max?: number
}

export interface CategoryConfig {
  showPrice: boolean
  showPriceType: boolean
  showCondition: boolean
  showShipping: boolean
  priceLabel: string
  conditionOptions: Array<{ value: string; label: string }>
  titlePlaceholder: string
  descriptionPlaceholder: string
  primaryAttributes: AttributeField[]
  secondaryAttributes: AttributeField[]
  presetAttrs?: Record<string, string>
}

const ALL_CONDITIONS = [
  { value: 'new',        label: 'New' },
  { value: 'like_new',   label: 'Like New' },
  { value: 'good',       label: 'Good' },
  { value: 'fair',       label: 'Fair' },
  { value: 'parts_only', label: 'Parts Only' },
]

const PRODUCT_CONDITIONS = [
  { value: 'new',      label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good',     label: 'Good' },
  { value: 'fair',     label: 'Fair' },
]

// ─── Shared field fragments ───────────────────────────────────────────────────

const VEHICLE_PRIMARY: AttributeField[] = [
  { key: 'make',  label: 'Make',  type: 'text',   required: true, placeholder: 'e.g. Ford, BMW, Toyota' },
  { key: 'model', label: 'Model', type: 'text',   required: true, placeholder: 'e.g. Focus, 3 Series, Yaris' },
  { key: 'year',  label: 'Year',  type: 'number', required: true, min: 1960, max: new Date().getFullYear() + 1, placeholder: 'e.g. 2019' },
]

const SALARY_SECONDARY: AttributeField[] = [
  { key: 'salary_min',    label: 'Min Salary (£)',  type: 'number', placeholder: 'e.g. 25000' },
  { key: 'salary_max',    label: 'Max Salary (£)',  type: 'number', placeholder: 'e.g. 35000' },
  { key: 'salary_period', label: 'Salary Period',   type: 'select', options: ['Per year', 'Per hour', 'Per day', 'Per month'] },
]

// ─── Top-level category configs ───────────────────────────────────────────────

const TOP_LEVEL: Record<string, CategoryConfig> = {
  'cars-vehicles': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: false,
    priceLabel: 'Asking Price (£)',
    conditionOptions: ALL_CONDITIONS,
    titlePlaceholder: 'e.g. Ford Focus 1.6 Zetec 5dr — full service history',
    descriptionPlaceholder: 'Describe the vehicle — service history, any faults, what\'s included, reason for selling…',
    primaryAttributes: VEHICLE_PRIMARY,
    secondaryAttributes: [
      { key: 'mileage',      label: 'Mileage',     type: 'number', placeholder: 'e.g. 45000' },
      { key: 'fuel_type',    label: 'Fuel Type',   type: 'select', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'LPG', 'Other'] },
      { key: 'transmission', label: 'Gearbox',     type: 'select', options: ['Manual', 'Automatic', 'Semi-Automatic'] },
      { key: 'body_type',    label: 'Body Type',   type: 'select', options: ['Saloon', 'Hatchback', 'Estate', 'SUV / 4x4', 'Coupe', 'Convertible', 'MPV / Minivan', 'Other'] },
      { key: 'colour',       label: 'Colour',      type: 'text',   placeholder: 'e.g. Midnight Black' },
      { key: 'doors',        label: 'Doors',       type: 'select', options: ['2', '3', '4', '5'] },
      { key: 'engine_size',  label: 'Engine Size', type: 'text',   placeholder: 'e.g. 1.6L, 2.0T' },
    ],
  },

  'property': {
    showPrice: true, showPriceType: false, showCondition: false, showShipping: false,
    priceLabel: 'Price / Monthly Rent (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. 3-bed semi-detached house for sale in Brixton',
    descriptionPlaceholder: 'Describe the property — layout, features, nearby transport, schools, amenities…',
    primaryAttributes: [
      { key: 'listing_type',  label: 'Listing Type',  type: 'select', required: true, options: ['For Sale', 'To Rent', 'Room Share', 'Holiday Let'] },
      { key: 'property_type', label: 'Property Type', type: 'select', required: true, options: ['House', 'Flat / Apartment', 'Studio', 'Bungalow', 'Terraced', 'Semi-Detached', 'Detached', 'Maisonette', 'Commercial', 'Land / Plot', 'Other'] },
      { key: 'bedrooms',      label: 'Bedrooms',      type: 'select', options: ['Studio', '1', '2', '3', '4', '5', '6+'] },
      { key: 'bathrooms',     label: 'Bathrooms',     type: 'select', options: ['1', '2', '3', '4+'] },
    ],
    secondaryAttributes: [
      { key: 'furnished',  label: 'Furnished',           type: 'select', options: ['Furnished', 'Unfurnished', 'Part Furnished'] },
      { key: 'parking',    label: 'Parking',             type: 'select', options: ['No Parking', 'Off-street Parking', 'Garage', 'On-street Parking'] },
      { key: 'floor_area', label: 'Floor Area (sq ft)',  type: 'number', placeholder: 'e.g. 850' },
    ],
  },

  'jobs': {
    showPrice: false, showPriceType: false, showCondition: false, showShipping: false,
    priceLabel: '',
    conditionOptions: [],
    titlePlaceholder: 'e.g. Senior Software Engineer',
    descriptionPlaceholder: 'Describe the role — responsibilities, requirements, benefits, how to apply…',
    primaryAttributes: [
      { key: 'company',          label: 'Company / Employer', type: 'text',   placeholder: 'e.g. Acme Ltd' },
      { key: 'job_type',         label: 'Job Type',           type: 'select', required: true, options: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Temporary', 'Apprenticeship'] },
      { key: 'work_location',    label: 'Work Location',      type: 'select', options: ['On-site', 'Remote', 'Hybrid'] },
      { key: 'experience_level', label: 'Experience Level',   type: 'select', options: ['No experience required', 'Entry level', 'Mid level', 'Senior', 'Director / Executive'] },
    ],
    secondaryAttributes: SALARY_SECONDARY,
  },

  'electronics': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. Apple iPhone 14 Pro 256GB Space Black',
    descriptionPlaceholder: 'Describe the item — specs, what\'s in the box, any faults, reason for selling…',
    primaryAttributes: [
      { key: 'brand',      label: 'Brand', type: 'text', placeholder: 'e.g. Apple, Samsung, Sony' },
      { key: 'model_name', label: 'Model', type: 'text', placeholder: 'e.g. iPhone 14 Pro, Galaxy S23' },
    ],
    secondaryAttributes: [
      { key: 'storage', label: 'Storage / Capacity', type: 'text', placeholder: 'e.g. 256GB, 1TB' },
      { key: 'colour',  label: 'Colour',             type: 'text', placeholder: 'e.g. Space Grey' },
    ],
  },

  'home-garden': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. Solid oak dining table with 4 chairs',
    descriptionPlaceholder: 'Describe the item — dimensions, material, age, any damage, reason for selling…',
    primaryAttributes: [
      { key: 'room', label: 'Room', type: 'select', options: ['Living Room', 'Bedroom', 'Kitchen & Dining', 'Bathroom', 'Garden & Outdoor', 'Office / Study', 'Garage & Workshop', 'Hallway', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'brand',    label: 'Brand',    type: 'text', placeholder: 'e.g. IKEA, Dyson, Bosch' },
      { key: 'material', label: 'Material', type: 'text', placeholder: 'e.g. Oak, Stainless Steel' },
    ],
  },

  'pets': {
    showPrice: true, showPriceType: true, showCondition: false, showShipping: false,
    priceLabel: 'Price (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. Labrador puppies ready to leave',
    descriptionPlaceholder: 'Describe the pet — temperament, health, diet, what\'s included, viewing arrangements…',
    primaryAttributes: [
      { key: 'animal_type', label: 'Animal Type', type: 'select', required: true, options: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Guinea Pig', 'Fish & Aquatics', 'Horse / Pony', 'Reptile', 'Small Animal', 'Other'] },
      { key: 'breed',       label: 'Breed',       type: 'text',   placeholder: 'e.g. Labrador Retriever, British Shorthair' },
      { key: 'age',         label: 'Age',         type: 'text',   placeholder: 'e.g. 8 weeks, 2 years' },
      { key: 'gender',      label: 'Gender',      type: 'select', options: ['Male', 'Female', 'Unknown'] },
    ],
    secondaryAttributes: [
      { key: 'vaccinated',    label: 'Vaccinated',        type: 'select', options: ['Yes – up to date', 'Yes – partially', 'No', 'Unknown'] },
      { key: 'neutered',      label: 'Neutered / Spayed', type: 'select', options: ['Yes', 'No'] },
      { key: 'microchipped',  label: 'Microchipped',      type: 'select', options: ['Yes', 'No'] },
      { key: 'kc_registered', label: 'KC Registered',     type: 'select', options: ['Yes', 'No'] },
    ],
  },

  'fashion': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. Nike Air Max 90 White UK9 — worn once',
    descriptionPlaceholder: 'Describe the item — brand, size, any flaws, measurements, reason for selling…',
    primaryAttributes: [
      { key: 'gender',        label: 'For',  type: 'select', required: true, options: ['Women', 'Men', 'Girls', 'Boys', 'Unisex'] },
      { key: 'clothing_type', label: 'Type', type: 'select', options: ['Tops & T-Shirts', 'Trousers & Jeans', 'Dresses & Skirts', 'Shoes & Boots', 'Jackets & Coats', 'Sportswear', 'Swimwear', 'Underwear', 'Accessories', 'Bags & Wallets', 'Jewellery', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'brand',  label: 'Brand',  type: 'text', placeholder: 'e.g. Nike, Zara, H&M' },
      { key: 'size',   label: 'Size',   type: 'text', placeholder: 'e.g. M, L, UK10, 32W' },
      { key: 'colour', label: 'Colour', type: 'text', placeholder: 'e.g. Navy Blue' },
    ],
  },

  'sport-leisure': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: ALL_CONDITIONS,
    titlePlaceholder: 'e.g. Trek mountain bike 18" frame — barely used',
    descriptionPlaceholder: 'Describe the item — brand, age, any damage, reason for selling…',
    primaryAttributes: [
      { key: 'sport_type', label: 'Sport / Activity', type: 'text', placeholder: 'e.g. Cycling, Football, Yoga, Golf' },
    ],
    secondaryAttributes: [
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Adidas, Trek, Wilson' },
      { key: 'size',  label: 'Size',  type: 'text', placeholder: 'e.g. 18" frame, XL, 8kg' },
    ],
  },

  'kids-baby': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. Mothercare pushchair — excellent condition',
    descriptionPlaceholder: 'Describe the item — age group, brand, condition, what\'s included…',
    primaryAttributes: [
      { key: 'age_group', label: 'Age Group', type: 'select', options: ['0-3 months', '3-6 months', '6-12 months', '1-2 years', '2-3 years', '3-5 years', '5-7 years', '7-10 years', '10+ years', 'All ages'] },
      { key: 'gender',    label: 'For',       type: 'select', options: ['Girls', 'Boys', 'Unisex'] },
    ],
    secondaryAttributes: [
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Mothercare, Chicco, Graco' },
    ],
  },

  'services': {
    showPrice: true, showPriceType: false, showCondition: false, showShipping: false,
    priceLabel: 'Rate / Price (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. Experienced plumber — same-day service',
    descriptionPlaceholder: 'Describe your service — what\'s included, experience, qualifications, area covered…',
    primaryAttributes: [
      { key: 'service_type',  label: 'Service Type', type: 'select', required: true, options: ['Cleaning', 'Plumbing', 'Electrical', 'Gardening', 'Removal & Delivery', 'Tutoring & Teaching', 'Web & IT', 'Design & Creative', 'Beauty & Wellbeing', 'Childcare', 'Pet Care', 'Catering & Events', 'Building & Maintenance', 'Other'] },
      { key: 'work_location', label: 'Work Type',    type: 'select', options: ['On-site only', 'Remote only', 'On-site or remote'] },
    ],
    secondaryAttributes: [
      { key: 'rate_period',      label: 'Rate Type',    type: 'select', options: ['Per hour', 'Per day', 'Fixed price', 'Price on application'] },
      { key: 'experience_years', label: 'Experience',   type: 'select', options: ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10+ years'] },
      { key: 'availability',     label: 'Availability', type: 'select', options: ['Weekdays', 'Weekends', 'Evenings', 'Flexible / any time'] },
    ],
  },

  'community': {
    showPrice: true, showPriceType: true, showCondition: false, showShipping: false,
    priceLabel: 'Price (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. Lost tabby cat in Camden — please help',
    descriptionPlaceholder: 'Provide as much detail as possible…',
    primaryAttributes: [
      { key: 'community_type', label: 'Type', type: 'select', required: true, options: ['Lost & Found', 'Free Stuff', 'Events & Activities', 'Volunteering', 'Carpool / Rideshare', 'Announcements', 'Other'] },
    ],
    secondaryAttributes: [],
  },

  'business-industrial': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: ALL_CONDITIONS,
    titlePlaceholder: 'e.g. Commercial catering oven — 6 burner gas',
    descriptionPlaceholder: 'Describe the item — specs, age, condition details, reason for selling…',
    primaryAttributes: [
      { key: 'industry_type', label: 'Category', type: 'select', options: ['Office Equipment', 'Tools & Machinery', 'Catering Equipment', 'Agricultural', 'Medical & Dental', 'Retail Fixtures', 'Printing & Signage', 'Construction', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'brand',    label: 'Brand',              type: 'text',   placeholder: 'e.g. Bosch, Caterpillar, Xerox' },
      { key: 'quantity', label: 'Quantity Available', type: 'number', placeholder: '1', min: 1 },
    ],
  },

  'other': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: ALL_CONDITIONS,
    titlePlaceholder: 'What are you selling?',
    descriptionPlaceholder: 'Describe your item…',
    primaryAttributes: [],
    secondaryAttributes: [],
  },
}

// ─── Subcategory configs ──────────────────────────────────────────────────────

const SUB: Record<string, CategoryConfig> = {
  // ── Cars & Vehicles ──────────────────────────────────────────────────────
  'cars': {
    ...TOP_LEVEL['cars-vehicles'],
    titlePlaceholder: 'e.g. Ford Focus 1.6 Zetec 5dr — full service history',
    secondaryAttributes: [
      { key: 'mileage',      label: 'Mileage',     type: 'number', placeholder: 'e.g. 45000' },
      { key: 'fuel_type',    label: 'Fuel Type',   type: 'select', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'LPG', 'Other'] },
      { key: 'transmission', label: 'Gearbox',     type: 'select', options: ['Manual', 'Automatic', 'Semi-Automatic'] },
      { key: 'body_type',    label: 'Body Type',   type: 'select', options: ['Saloon', 'Hatchback', 'Estate', 'SUV / 4x4', 'Coupe', 'Convertible', 'MPV / Minivan', 'Other'] },
      { key: 'colour',       label: 'Colour',      type: 'text',   placeholder: 'e.g. Midnight Black' },
      { key: 'doors',        label: 'Doors',       type: 'select', options: ['2', '3', '4', '5'] },
      { key: 'engine_size',  label: 'Engine Size', type: 'text',   placeholder: 'e.g. 1.6L, 2.0T' },
    ],
  },

  'motorbikes': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: false,
    priceLabel: 'Asking Price (£)',
    conditionOptions: ALL_CONDITIONS,
    titlePlaceholder: 'e.g. Honda CB500F 2020 — low mileage',
    descriptionPlaceholder: 'Describe the bike — service history, modifications, any faults, reason for selling…',
    primaryAttributes: VEHICLE_PRIMARY,
    secondaryAttributes: [
      { key: 'mileage',    label: 'Mileage',     type: 'number', placeholder: 'e.g. 8000' },
      { key: 'engine_cc',  label: 'Engine (CC)', type: 'number', placeholder: 'e.g. 500, 1000' },
      { key: 'bike_type',  label: 'Bike Type',   type: 'select', options: ['Naked / Street', 'Sports / Supersport', 'Cruiser', 'Tourer / Adventure', 'Scooter', 'Off-road / Trail', 'Moped', 'Classic', 'Other'] },
      { key: 'colour',     label: 'Colour',      type: 'text',   placeholder: 'e.g. Racing Red' },
    ],
  },

  'vans': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: false,
    priceLabel: 'Asking Price (£)',
    conditionOptions: ALL_CONDITIONS,
    titlePlaceholder: 'e.g. Ford Transit Custom 2019 — one owner',
    descriptionPlaceholder: 'Describe the van — service history, payload, any faults, reason for selling…',
    primaryAttributes: VEHICLE_PRIMARY,
    secondaryAttributes: [
      { key: 'mileage',      label: 'Mileage',       type: 'number', placeholder: 'e.g. 60000' },
      { key: 'fuel_type',    label: 'Fuel Type',     type: 'select', options: ['Diesel', 'Petrol', 'Electric', 'Hybrid', 'Other'] },
      { key: 'transmission', label: 'Gearbox',       type: 'select', options: ['Manual', 'Automatic'] },
      { key: 'van_type',     label: 'Van Type',      type: 'select', options: ['Panel Van', 'Window Van', 'Tipper', 'Pick-up Truck', 'Dropside', 'Luton', 'Minibus', 'Refrigerated', 'Other'] },
      { key: 'payload_kg',   label: 'Payload (kg)',  type: 'number', placeholder: 'e.g. 800' },
      { key: 'colour',       label: 'Colour',        type: 'text',   placeholder: 'e.g. White' },
    ],
  },

  'campervans': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: false,
    priceLabel: 'Asking Price (£)',
    conditionOptions: ALL_CONDITIONS,
    titlePlaceholder: 'e.g. VW Transporter campervan 2018 — 4-berth',
    descriptionPlaceholder: 'Describe the camper — layout, conversion spec, equipment included, service history…',
    primaryAttributes: VEHICLE_PRIMARY,
    secondaryAttributes: [
      { key: 'mileage',      label: 'Mileage',       type: 'number', placeholder: 'e.g. 55000' },
      { key: 'fuel_type',    label: 'Fuel Type',     type: 'select', options: ['Diesel', 'Petrol', 'Electric', 'Other'] },
      { key: 'transmission', label: 'Gearbox',       type: 'select', options: ['Manual', 'Automatic'] },
      { key: 'berths',       label: 'Sleeping Berths', type: 'select', options: ['1', '2', '3', '4', '5', '6+'] },
      { key: 'layout',       label: 'Layout',        type: 'select', options: ['End Bedroom', 'Fixed Bed', 'Island Bed', 'Bunk Beds', 'Dinette / Fold-out', 'Other'] },
      { key: 'colour',       label: 'Colour',        type: 'text',   placeholder: 'e.g. White / Grey' },
    ],
  },

  'parts-accessories': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: ALL_CONDITIONS,
    titlePlaceholder: 'e.g. Ford Focus ST front bumper 2015-2018',
    descriptionPlaceholder: 'Describe the part — condition, part number if known, which vehicles it fits…',
    primaryAttributes: [
      { key: 'part_type', label: 'Part Type', type: 'select', required: true, options: ['Engine & Transmission', 'Bodywork & Panels', 'Interior', 'Wheels & Tyres', 'Electrics & Lighting', 'Exhausts & Emissions', 'Brakes', 'Suspension & Steering', 'Servicing & Maintenance', 'Tools & Workshop', 'Accessories', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'compatible_make',  label: 'Compatible Make',  type: 'text', placeholder: 'e.g. Ford' },
      { key: 'compatible_model', label: 'Compatible Model', type: 'text', placeholder: 'e.g. Focus' },
    ],
  },

  // ── Property ─────────────────────────────────────────────────────────────
  'property-for-sale': {
    showPrice: true, showPriceType: false, showCondition: false, showShipping: false,
    priceLabel: 'Asking Price (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. 3-bed semi-detached for sale — Brixton, London',
    descriptionPlaceholder: 'Describe the property — layout, features, nearby transport, schools, amenities…',
    presetAttrs: { listing_type: 'For Sale' },
    primaryAttributes: [
      { key: 'property_type', label: 'Property Type', type: 'select', required: true, options: ['House', 'Flat / Apartment', 'Studio', 'Bungalow', 'Terraced', 'Semi-Detached', 'Detached', 'Maisonette', 'Land / Plot', 'Other'] },
      { key: 'bedrooms',      label: 'Bedrooms',      type: 'select', options: ['Studio', '1', '2', '3', '4', '5', '6+'] },
      { key: 'bathrooms',     label: 'Bathrooms',     type: 'select', options: ['1', '2', '3', '4+'] },
    ],
    secondaryAttributes: [
      { key: 'tenure',     label: 'Tenure',   type: 'select', options: ['Freehold', 'Leasehold', 'Share of Freehold', 'Commonhold'] },
      { key: 'parking',    label: 'Parking',  type: 'select', options: ['No Parking', 'Off-street Parking', 'Garage', 'On-street Parking'] },
      { key: 'garden',     label: 'Garden',   type: 'select', options: ['Yes', 'No'] },
      { key: 'floor_area', label: 'Floor Area (sq ft)', type: 'number', placeholder: 'e.g. 950' },
    ],
  },

  'property-to-rent': {
    showPrice: true, showPriceType: false, showCondition: false, showShipping: false,
    priceLabel: 'Monthly Rent (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. 2-bed flat to rent — city centre, bills negotiable',
    descriptionPlaceholder: 'Describe the property — layout, features, nearby transport, what\'s included in rent…',
    presetAttrs: { listing_type: 'To Rent' },
    primaryAttributes: [
      { key: 'property_type', label: 'Property Type', type: 'select', required: true, options: ['House', 'Flat / Apartment', 'Studio', 'Bungalow', 'Terraced', 'Semi-Detached', 'Detached', 'Maisonette', 'Other'] },
      { key: 'bedrooms',      label: 'Bedrooms',      type: 'select', options: ['Studio', '1', '2', '3', '4', '5', '6+'] },
      { key: 'bathrooms',     label: 'Bathrooms',     type: 'select', options: ['1', '2', '3', '4+'] },
    ],
    secondaryAttributes: [
      { key: 'furnished',       label: 'Furnished',             type: 'select', options: ['Furnished', 'Unfurnished', 'Part Furnished'] },
      { key: 'available_from',  label: 'Available From',        type: 'text',   placeholder: 'e.g. 1st July 2026' },
      { key: 'bills_included',  label: 'Bills Included',        type: 'select', options: ['No bills included', 'All bills included', 'Some bills included'] },
      { key: 'min_tenancy',     label: 'Min Tenancy',           type: 'select', options: ['6 months', '12 months', 'Flexible'] },
    ],
  },

  'property-to-share': {
    showPrice: true, showPriceType: false, showCondition: false, showShipping: false,
    priceLabel: 'Monthly Rent (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. Double room in 3-bed house share — Shoreditch',
    descriptionPlaceholder: 'Describe the room and house — housemates, house rules, what\'s included…',
    presetAttrs: { listing_type: 'Room Share' },
    primaryAttributes: [
      { key: 'room_type',           label: 'Room Type',               type: 'select', required: true, options: ['Double Room', 'Single Room', 'En-suite', 'Studio Room', 'Bedsit', 'Other'] },
      { key: 'bedrooms_in_property', label: 'Total Rooms in Property', type: 'select', options: ['2', '3', '4', '5', '6+'] },
    ],
    secondaryAttributes: [
      { key: 'furnished',      label: 'Furnished',        type: 'select', options: ['Furnished', 'Unfurnished', 'Part Furnished'] },
      { key: 'available_from', label: 'Available From',   type: 'text',   placeholder: 'e.g. 1st July 2026' },
      { key: 'bills_included', label: 'Bills Included',   type: 'select', options: ['No bills included', 'All bills included', 'Some bills included'] },
      { key: 'smokers',        label: 'Smokers',          type: 'select', options: ['Non-smokers only', 'Smokers welcome', 'Outside smoking OK'] },
      { key: 'pets',           label: 'Pets',             type: 'select', options: ['No pets', 'Pets welcome', 'Ask landlord'] },
    ],
  },

  'holiday-lets': {
    showPrice: true, showPriceType: false, showCondition: false, showShipping: false,
    priceLabel: 'Price per night (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. Cosy 2-bed cottage — Peak District, sleeps 4',
    descriptionPlaceholder: 'Describe the property — amenities, what\'s included, nearby attractions, house rules…',
    presetAttrs: { listing_type: 'Holiday Let' },
    primaryAttributes: [
      { key: 'property_type', label: 'Property Type', type: 'select', required: true, options: ['House', 'Cottage', 'Flat / Apartment', 'Cabin / Lodge', 'Villa', 'Barn Conversion', 'Glamping / Unique', 'Other'] },
      { key: 'max_guests',    label: 'Max Guests',    type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '10', '12+'] },
      { key: 'bedrooms',      label: 'Bedrooms',      type: 'select', options: ['Studio', '1', '2', '3', '4', '5', '6+'] },
    ],
    secondaryAttributes: [
      { key: 'min_stay',    label: 'Minimum Stay',      type: 'select', options: ['1 night', '2 nights', '3 nights', '4 nights', '1 week', '2 weeks'] },
      { key: 'pet_friendly', label: 'Pet Friendly',     type: 'select', options: ['Yes', 'No'] },
      { key: 'wifi',         label: 'WiFi',             type: 'select', options: ['Yes', 'No'] },
      { key: 'parking',      label: 'Parking',          type: 'select', options: ['Yes – free', 'Yes – paid', 'No parking'] },
    ],
  },

  'property-commercial': {
    showPrice: true, showPriceType: false, showCondition: false, showShipping: false,
    priceLabel: 'Price / Monthly Rent (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. 500 sq ft office space to let — Manchester city centre',
    descriptionPlaceholder: 'Describe the property — layout, facilities, access, lease terms…',
    presetAttrs: { listing_type: 'Commercial' },
    primaryAttributes: [
      { key: 'commercial_type', label: 'Property Type', type: 'select', required: true, options: ['Office', 'Retail Unit / Shop', 'Restaurant / Café', 'Warehouse / Storage', 'Industrial / Factory', 'Workshop / Studio', 'Land / Plot', 'Other'] },
      { key: 'lease_type',      label: 'Listing Type',  type: 'select', options: ['For Sale', 'To Rent / Let', 'Short Let'] },
    ],
    secondaryAttributes: [
      { key: 'floor_area',  label: 'Floor Area (sq ft)', type: 'number', placeholder: 'e.g. 500' },
      { key: 'parking',     label: 'Parking',            type: 'select', options: ['Yes', 'No', 'Nearby'] },
    ],
  },

  // ── Jobs ─────────────────────────────────────────────────────────────────
  'jobs-it': {
    ...TOP_LEVEL['jobs'],
    titlePlaceholder: 'e.g. Senior React Developer — fully remote',
    presetAttrs: { sector: 'IT & Technology' },
    primaryAttributes: [
      { key: 'company',          label: 'Company / Employer', type: 'text',   placeholder: 'e.g. Tech Startup Ltd' },
      { key: 'job_type',         label: 'Job Type',           type: 'select', required: true, options: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'] },
      { key: 'work_location',    label: 'Work Location',      type: 'select', options: ['On-site', 'Remote', 'Hybrid'] },
      { key: 'experience_level', label: 'Experience Level',   type: 'select', options: ['No experience required', 'Entry level', 'Mid level', 'Senior', 'Lead / Principal', 'Director / CTO'] },
    ],
    secondaryAttributes: SALARY_SECONDARY,
  },

  'jobs-hospitality': {
    ...TOP_LEVEL['jobs'],
    titlePlaceholder: 'e.g. Head Chef — busy restaurant, central London',
    primaryAttributes: [
      { key: 'company',      label: 'Employer / Venue', type: 'text',   placeholder: 'e.g. The Crown Hotel' },
      { key: 'job_type',     label: 'Job Type',         type: 'select', required: true, options: ['Full-time', 'Part-time', 'Seasonal', 'Zero-hours', 'Temporary'] },
      { key: 'role_type',    label: 'Role Type',        type: 'select', options: ['Chef / Kitchen', 'Front of House', 'Bar Staff', 'Management', 'Housekeeping', 'Events', 'Other'] },
      { key: 'work_location', label: 'Work Type',       type: 'select', options: ['On-site', 'Live-in position'] },
    ],
    secondaryAttributes: SALARY_SECONDARY,
  },

  'jobs-driving': {
    ...TOP_LEVEL['jobs'],
    titlePlaceholder: 'e.g. HGV Class 1 Driver — night shifts, £18/hr',
    primaryAttributes: [
      { key: 'company',       label: 'Company',        type: 'text',   placeholder: 'e.g. Logistics Co Ltd' },
      { key: 'job_type',      label: 'Job Type',       type: 'select', required: true, options: ['Full-time', 'Part-time', 'Temporary', 'Self-employed'] },
      { key: 'vehicle_type',  label: 'Vehicle',        type: 'select', options: ['Car / Van', 'HGV Class 1 (Artic)', 'HGV Class 2 (Rigid)', 'Motorcycle', 'Bicycle / E-bike', 'Other'] },
      { key: 'licence_required', label: 'Licence Required', type: 'select', options: ['Full UK Driving Licence', 'Cat C1 (Medium goods)', 'Cat C (Large goods)', 'Cat C+E (HGV)', 'Motorcycle licence', 'No licence required'] },
    ],
    secondaryAttributes: SALARY_SECONDARY,
  },

  // All other jobs subcategories inherit the top-level jobs config
  // (jobs-retail, jobs-healthcare, jobs-admin handled by fallback)

  // ── Electronics ──────────────────────────────────────────────────────────
  'phones': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. Apple iPhone 14 Pro 256GB Space Black — unlocked',
    descriptionPlaceholder: 'Describe the phone — any scratches/faults, what\'s in the box, reason for selling…',
    primaryAttributes: [
      { key: 'brand',      label: 'Brand', type: 'select', required: true, options: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Nokia', 'Motorola', 'Sony', 'Other'] },
      { key: 'model_name', label: 'Model', type: 'text',   required: true, placeholder: 'e.g. iPhone 14 Pro, Galaxy S23 Ultra' },
    ],
    secondaryAttributes: [
      { key: 'storage', label: 'Storage',        type: 'select', options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] },
      { key: 'colour',  label: 'Colour',         type: 'text',   placeholder: 'e.g. Space Black' },
      { key: 'network', label: 'Network / Lock', type: 'select', options: ['Unlocked', 'O2', 'EE', 'Vodafone', 'Three', 'Sky Mobile', 'Other'] },
    ],
  },

  'computers': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. Apple MacBook Pro M2 16" 2022 — 16GB RAM, 512GB SSD',
    descriptionPlaceholder: 'Describe the computer — specs, included accessories, any faults, reason for selling…',
    primaryAttributes: [
      { key: 'brand',      label: 'Brand', type: 'select', required: true, options: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Microsoft', 'Razer', 'Samsung', 'Custom / PC Build', 'Other'] },
      { key: 'model_name', label: 'Model', type: 'text',   required: true, placeholder: 'e.g. MacBook Pro 16", Dell XPS 15' },
    ],
    secondaryAttributes: [
      { key: 'processor',    label: 'Processor',     type: 'text',   placeholder: 'e.g. Intel i7-12700H, Apple M2 Pro' },
      { key: 'ram',          label: 'RAM',           type: 'select', options: ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB+'] },
      { key: 'storage',      label: 'Storage',       type: 'select', options: ['128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', '1TB HDD', '2TB HDD', 'Other'] },
      { key: 'screen_size',  label: 'Screen Size',   type: 'text',   placeholder: 'e.g. 13", 15.6"' },
      { key: 'os',           label: 'Operating System', type: 'select', options: ['Windows 11', 'Windows 10', 'macOS', 'Linux', 'ChromeOS', 'No OS'] },
    ],
  },

  'tvs': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: false,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. Samsung 55" 4K QLED Smart TV — 2022',
    descriptionPlaceholder: 'Describe the TV — any issues, what\'s included (remote, stand), reason for selling…',
    primaryAttributes: [
      { key: 'brand',       label: 'Brand',       type: 'select', required: true, options: ['Samsung', 'LG', 'Sony', 'Hisense', 'Philips', 'Panasonic', 'TCL', 'Toshiba', 'Other'] },
      { key: 'screen_size', label: 'Screen Size (inches)', type: 'number', required: true, placeholder: 'e.g. 55', min: 19, max: 100 },
    ],
    secondaryAttributes: [
      { key: 'resolution', label: 'Resolution', type: 'select', options: ['8K', '4K / UHD', 'Full HD (1080p)', 'HD Ready (720p)', 'Standard (480p)'] },
      { key: 'smart_tv',   label: 'Smart TV',   type: 'select', options: ['Yes – Smart TV', 'No – Standard TV'] },
      { key: 'screen_type', label: 'Screen Type', type: 'select', options: ['OLED', 'QLED / QOLED', 'LED', 'LCD', 'AMOLED', 'Other'] },
    ],
  },

  'cameras': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. Sony A7 III mirrorless camera — body only',
    descriptionPlaceholder: 'Describe the camera — shutter count, included accessories, any faults, reason for selling…',
    primaryAttributes: [
      { key: 'brand',       label: 'Brand',       type: 'select', required: true, options: ['Sony', 'Canon', 'Nikon', 'Fujifilm', 'Olympus', 'Panasonic', 'Leica', 'GoPro', 'DJI', 'Other'] },
      { key: 'model_name',  label: 'Model',       type: 'text',   required: true, placeholder: 'e.g. A7 III, EOS R6, Z6 II' },
    ],
    secondaryAttributes: [
      { key: 'camera_type', label: 'Camera Type', type: 'select', options: ['DSLR', 'Mirrorless', 'Point & Shoot / Compact', 'Bridge', 'Action Camera', 'Camcorder', 'Instant / Film', 'Other'] },
      { key: 'megapixels',  label: 'Megapixels',  type: 'text',   placeholder: 'e.g. 24MP, 42MP' },
    ],
  },

  'audio': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. Sony WH-1000XM5 wireless headphones — barely used',
    descriptionPlaceholder: 'Describe the item — any faults, what\'s included, reason for selling…',
    primaryAttributes: [
      { key: 'brand',      label: 'Brand',      type: 'text', placeholder: 'e.g. Sony, Bose, Bang & Olufsen' },
      { key: 'model_name', label: 'Model',      type: 'text', placeholder: 'e.g. WH-1000XM5, QuietComfort 45' },
    ],
    secondaryAttributes: [
      { key: 'audio_type', label: 'Type', type: 'select', options: ['Headphones / Earbuds', 'Speakers', 'Soundbar', 'Amplifier', 'Hi-Fi System', 'Turntable / Record Player', 'Subwoofer', 'DAC / Pre-amp', 'Other'] },
    ],
  },

  'video-games': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. PlayStation 5 console — disc edition, boxed',
    descriptionPlaceholder: 'Describe the item — what\'s included, any faults, reason for selling…',
    primaryAttributes: [
      { key: 'platform',  label: 'Platform',  type: 'select', required: true, options: ['PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'Nintendo Switch Lite', 'PC', 'Retro / Other'] },
      { key: 'item_type', label: 'Item Type', type: 'select', required: true, options: ['Console', 'Game / Software', 'Controller', 'Accessory', 'Bundle', 'Collector\'s Edition', 'Other'] },
    ],
    secondaryAttributes: [],
  },

  // ── Pets ─────────────────────────────────────────────────────────────────
  'dogs': {
    showPrice: true, showPriceType: true, showCondition: false, showShipping: false,
    priceLabel: 'Price (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. KC Registered Labrador puppies — ready now',
    descriptionPlaceholder: 'Describe the dog — temperament, health, diet, viewing arrangements, what\'s included…',
    presetAttrs: { animal_type: 'Dog' },
    primaryAttributes: [
      { key: 'breed',  label: 'Breed',  type: 'text',   placeholder: 'e.g. Labrador Retriever, French Bulldog' },
      { key: 'age',    label: 'Age',    type: 'text',   placeholder: 'e.g. 8 weeks, 2 years' },
      { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
    ],
    secondaryAttributes: [
      { key: 'vaccinated',    label: 'Vaccinated',        type: 'select', options: ['Yes – up to date', 'Yes – partially', 'No', 'Unknown'] },
      { key: 'neutered',      label: 'Neutered / Spayed', type: 'select', options: ['Yes', 'No'] },
      { key: 'microchipped',  label: 'Microchipped',      type: 'select', options: ['Yes', 'No'] },
      { key: 'kc_registered', label: 'KC Registered',     type: 'select', options: ['Yes', 'No'] },
    ],
  },

  'cats': {
    showPrice: true, showPriceType: true, showCondition: false, showShipping: false,
    priceLabel: 'Price (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. British Shorthair kittens — ready in 2 weeks',
    descriptionPlaceholder: 'Describe the cat — temperament, health, litter trained, what\'s included…',
    presetAttrs: { animal_type: 'Cat' },
    primaryAttributes: [
      { key: 'breed',  label: 'Breed',  type: 'text',   placeholder: 'e.g. British Shorthair, Bengal, Ragdoll' },
      { key: 'age',    label: 'Age',    type: 'text',   placeholder: 'e.g. 8 weeks, 3 years' },
      { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
    ],
    secondaryAttributes: [
      { key: 'vaccinated',   label: 'Vaccinated',        type: 'select', options: ['Yes – up to date', 'Yes – partially', 'No', 'Unknown'] },
      { key: 'neutered',     label: 'Neutered / Spayed', type: 'select', options: ['Yes', 'No'] },
      { key: 'microchipped', label: 'Microchipped',      type: 'select', options: ['Yes', 'No'] },
      { key: 'indoor_only',  label: 'Indoor / Outdoor',  type: 'select', options: ['Indoor only', 'Outdoor access', 'Both'] },
    ],
  },

  'birds': {
    showPrice: true, showPriceType: true, showCondition: false, showShipping: false,
    priceLabel: 'Price (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. African Grey parrot — well socialised, cage included',
    descriptionPlaceholder: 'Describe the bird — temperament, diet, cage setup, what\'s included…',
    presetAttrs: { animal_type: 'Bird' },
    primaryAttributes: [
      { key: 'species', label: 'Species', type: 'select', required: true, options: ['Parrot', 'African Grey', 'Macaw', 'Cockatiel', 'Budgerigar / Budgie', 'Canary', 'Finch', 'Dove / Pigeon', 'Lovebird', 'Conure', 'Other'] },
      { key: 'age',     label: 'Age',     type: 'text',   placeholder: 'e.g. 6 months, 3 years' },
      { key: 'gender',  label: 'Gender',  type: 'select', options: ['Male', 'Female', 'Unknown'] },
    ],
    secondaryAttributes: [
      { key: 'vaccinated',    label: 'Vaccinated',    type: 'select', options: ['Yes', 'No', 'Unknown'] },
      { key: 'hand_reared',   label: 'Hand Reared',   type: 'select', options: ['Yes', 'No'] },
      { key: 'cage_included', label: 'Cage Included', type: 'select', options: ['Yes', 'No'] },
    ],
  },

  'fish': {
    showPrice: true, showPriceType: true, showCondition: false, showShipping: false,
    priceLabel: 'Price (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. Tropical fish bundle — 20 fish + full tank setup',
    descriptionPlaceholder: 'Describe the fish — species, health, tank setup, what\'s included…',
    presetAttrs: { animal_type: 'Fish' },
    primaryAttributes: [
      { key: 'fish_type', label: 'Fish Type', type: 'select', required: true, options: ['Tropical (Freshwater)', 'Cold Water / Goldfish', 'Marine / Saltwater', 'Koi / Pond Fish', 'Other'] },
      { key: 'species',   label: 'Species',   type: 'text',   placeholder: 'e.g. Neon Tetra, Clownfish, Koi' },
      { key: 'quantity',  label: 'Quantity',  type: 'number', placeholder: 'e.g. 10', min: 1 },
    ],
    secondaryAttributes: [
      { key: 'tank_included',    label: 'Tank Included',     type: 'select', options: ['Yes – tank & equipment included', 'Tank available separately', 'Fish only'] },
      { key: 'tank_size_litres', label: 'Tank Size (litres)', type: 'number', placeholder: 'e.g. 120' },
    ],
  },

  'pet-equipment': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. Large dog crate — heavy duty, folding',
    descriptionPlaceholder: 'Describe the item — dimensions, brand, any wear, reason for selling…',
    primaryAttributes: [
      { key: 'equipment_type', label: 'Type', type: 'select', required: true, options: ['Cage / Crate / Hutch', 'Aquarium / Tank', 'Bed / Basket', 'Carrier / Crate', 'Collar / Lead / Harness', 'Clothing & Accessories', 'Food & Treats', 'Grooming', 'Training Equipment', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'suitable_for', label: 'Suitable For', type: 'select', options: ['Dogs', 'Cats', 'Birds', 'Rabbits', 'Fish', 'All Pets', 'Other'] },
      { key: 'brand',        label: 'Brand',        type: 'text',   placeholder: 'e.g. Kong, Ruffwear, Trixie' },
    ],
  },

  // ── Fashion ───────────────────────────────────────────────────────────────
  'womens-fashion': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. ASOS floral wrap dress — size 12, worn twice',
    descriptionPlaceholder: 'Describe the item — measurements, brand, any flaws, reason for selling…',
    presetAttrs: { gender: 'Women' },
    primaryAttributes: [
      { key: 'clothing_type', label: 'Type', type: 'select', required: true, options: ['Tops & T-Shirts', 'Blouses & Shirts', 'Jumpers & Cardigans', 'Dresses', 'Skirts', 'Trousers & Jeans', 'Leggings', 'Shorts', 'Jackets & Coats', 'Sportswear & Gym', 'Swimwear', 'Underwear & Lingerie', 'Nightwear', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'brand',  label: 'Brand',  type: 'text', placeholder: 'e.g. ASOS, Zara, H&M, Topshop' },
      { key: 'size',   label: 'Size',   type: 'text', placeholder: 'e.g. 10, 12, S, M, XL' },
      { key: 'colour', label: 'Colour', type: 'text', placeholder: 'e.g. Navy Blue' },
    ],
  },

  'mens-fashion': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. Ralph Lauren polo shirt — large, navy, worn once',
    descriptionPlaceholder: 'Describe the item — measurements, brand, any flaws, reason for selling…',
    presetAttrs: { gender: 'Men' },
    primaryAttributes: [
      { key: 'clothing_type', label: 'Type', type: 'select', required: true, options: ['T-Shirts & Polos', 'Shirts', 'Jumpers & Knitwear', 'Hoodies & Sweatshirts', 'Trousers & Jeans', 'Shorts', 'Suits & Blazers', 'Jackets & Coats', 'Sportswear & Gym', 'Underwear & Socks', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'brand',  label: 'Brand',  type: 'text', placeholder: 'e.g. Adidas, Next, Ralph Lauren' },
      { key: 'size',   label: 'Size',   type: 'text', placeholder: 'e.g. L, XL, 32W 30L, 42" chest' },
      { key: 'colour', label: 'Colour', type: 'text', placeholder: 'e.g. Navy' },
    ],
  },

  'kids-fashion': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. Next girls party dress — age 5, worn once',
    descriptionPlaceholder: 'Describe the item — brand, any flaws, reason for selling…',
    primaryAttributes: [
      { key: 'gender',        label: 'For',       type: 'select', required: true, options: ['Girls', 'Boys', 'Unisex'] },
      { key: 'clothing_type', label: 'Type',      type: 'select', options: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'School Uniform', 'Swimwear', 'Nightwear', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'age_group', label: 'Age',   type: 'select', options: ['0-3 months', '3-6 months', '6-12 months', '1-2 years', '2-3 years', '3-4 years', '4-5 years', '5-6 years', '6-7 years', '7-8 years', '8-9 years', '9-10 years', '10-11 years', '11-12 years', '12-13 years', '13-14 years', '14-15 years', '15-16 years'] },
      { key: 'brand',     label: 'Brand', type: 'text',   placeholder: 'e.g. Next, H&M, Zara Kids' },
    ],
  },

  'shoes': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. Nike Air Force 1 Low — UK10, white, worn twice',
    descriptionPlaceholder: 'Describe the shoes — any wear on sole/upper, box included, reason for selling…',
    primaryAttributes: [
      { key: 'gender',     label: 'For',       type: 'select', required: true, options: ['Women', 'Men', 'Boys', 'Girls', 'Unisex'] },
      { key: 'shoe_type',  label: 'Shoe Type', type: 'select', required: true, options: ['Trainers / Sneakers', 'Boots', 'Heels', 'Flats & Pumps', 'Sandals', 'Loafers & Moccasins', 'Work / Formal Shoes', 'Sports Shoes', 'Slippers', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'brand',   label: 'Brand',    type: 'text', placeholder: 'e.g. Nike, Adidas, Kurt Geiger' },
      { key: 'uk_size', label: 'UK Size',  type: 'text', placeholder: 'e.g. UK8, UK4, UK10' },
      { key: 'colour',  label: 'Colour',   type: 'text', placeholder: 'e.g. White / Black' },
    ],
  },

  'jewellery-watches': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: true,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. Casio G-Shock DW-5600 — black, box & papers',
    descriptionPlaceholder: 'Describe the item — any marks or wear, hallmarks, certificates, reason for selling…',
    primaryAttributes: [
      { key: 'item_type', label: 'Item Type', type: 'select', required: true, options: ['Watch', 'Ring', 'Necklace', 'Bracelet', 'Earrings', 'Brooch', 'Chain', 'Pendant', 'Set', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'brand',    label: 'Brand',    type: 'text',   placeholder: 'e.g. Casio, Pandora, Tiffany & Co' },
      { key: 'material', label: 'Material', type: 'select', options: ['Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum', 'Stainless Steel', 'Gold Plated', 'Other'] },
      { key: 'gender',   label: 'For',      type: 'select', options: ['Women', 'Men', 'Unisex'] },
    ],
  },

  // ── Sport & Leisure ───────────────────────────────────────────────────────
  'bikes': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: false,
    priceLabel: 'Price (£)',
    conditionOptions: ALL_CONDITIONS,
    titlePlaceholder: 'e.g. Trek FX3 hybrid bike 2021 — 18" frame, barely used',
    descriptionPlaceholder: 'Describe the bike — frame size, components, any repairs, reason for selling…',
    primaryAttributes: [
      { key: 'bike_type',    label: 'Bike Type',    type: 'select', required: true, options: ['Road Bike', 'Mountain Bike', 'Hybrid / City Bike', 'Electric Bike (e-bike)', 'BMX', 'Folding Bike', 'Gravel / Cyclocross', 'Kids Bike', 'Triathlon / TT', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'brand',            label: 'Brand',            type: 'text',   placeholder: 'e.g. Trek, Specialized, Giant' },
      { key: 'frame_size',       label: 'Frame Size',       type: 'text',   placeholder: 'e.g. 18", 56cm, Medium' },
      { key: 'frame_material',   label: 'Frame Material',   type: 'select', options: ['Aluminium', 'Carbon Fibre', 'Steel', 'Titanium', 'Other'] },
      { key: 'gears',            label: 'Gears',            type: 'text',   placeholder: 'e.g. Shimano 21-speed, SRAM 11-speed' },
    ],
  },

  'fitness-equipment': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: false,
    priceLabel: 'Price (£)',
    conditionOptions: ALL_CONDITIONS,
    titlePlaceholder: 'e.g. Concept2 Model D rowing machine — PM5, light use',
    descriptionPlaceholder: 'Describe the equipment — dimensions, weight capacity, any wear, reason for selling…',
    primaryAttributes: [
      { key: 'equipment_type', label: 'Equipment Type', type: 'select', required: true, options: ['Treadmill', 'Exercise Bike', 'Rowing Machine', 'Cross Trainer / Elliptical', 'Weights & Dumbbells', 'Barbell & Weight Plates', 'Kettlebells', 'Bench', 'Pull-up / Dip Bar', 'Multi-Gym', 'Yoga & Pilates', 'Boxing Equipment', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Concept2, Peloton, Rogue' },
    ],
  },

  'tickets': {
    showPrice: true, showPriceType: false, showCondition: false, showShipping: false,
    priceLabel: 'Price per ticket (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. Coldplay – Music of the Spheres Tour — 2x floor tickets',
    descriptionPlaceholder: 'Describe the tickets — section/row/seat numbers, how they\'ll be transferred, original face value…',
    primaryAttributes: [
      { key: 'event_type', label: 'Event Type', type: 'select', required: true, options: ['Concert / Music', 'Sport', 'Theatre / Musical', 'Comedy', 'Festival', 'Exhibition / Museum', 'Family / Kids', 'Other'] },
      { key: 'event_name', label: 'Event Name', type: 'text',   required: true, placeholder: 'e.g. Coldplay – Music of the Spheres Tour' },
    ],
    secondaryAttributes: [
      { key: 'venue',       label: 'Venue',         type: 'text',   placeholder: 'e.g. Wembley Stadium, London' },
      { key: 'event_date',  label: 'Event Date',    type: 'text',   placeholder: 'e.g. Sat 14 Jun 2026' },
      { key: 'quantity',    label: 'No. of Tickets', type: 'select', options: ['1', '2', '3', '4', '5', '6+'] },
      { key: 'ticket_type', label: 'Ticket Type',   type: 'select', options: ['Standing / General Admission', 'Seated', 'VIP / Hospitality', 'Other'] },
    ],
  },

  // ── Community ─────────────────────────────────────────────────────────────
  'events': {
    showPrice: true, showPriceType: true, showCondition: false, showShipping: false,
    priceLabel: 'Entry Price (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. Charity quiz night — The Crown pub, Sat 7pm',
    descriptionPlaceholder: 'Describe the event — what to expect, how to sign up, accessibility info…',
    presetAttrs: { community_type: 'Events & Activities' },
    primaryAttributes: [
      { key: 'event_type', label: 'Event Type', type: 'select', required: true, options: ['Music & Nightlife', 'Food & Drink', 'Art & Culture', 'Sport & Fitness', 'Charity & Fundraising', 'Business & Networking', 'Family & Kids', 'Outdoor & Adventure', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'event_date', label: 'Date & Time', type: 'text',   placeholder: 'e.g. Sat 20 Jun 2026 at 7pm' },
      { key: 'venue',      label: 'Venue',       type: 'text',   placeholder: 'e.g. The Crown, 12 High St, London' },
      { key: 'admission',  label: 'Admission',   type: 'select', options: ['Free entry', 'Paid – see price', 'Donations welcome'] },
    ],
  },

  'lost-found': {
    showPrice: false, showPriceType: false, showCondition: false, showShipping: false,
    priceLabel: '',
    conditionOptions: [],
    titlePlaceholder: 'e.g. FOUND: tabby cat, Camden area',
    descriptionPlaceholder: 'Describe the item/pet — colour, markings, distinguishing features, where and when…',
    presetAttrs: { community_type: 'Lost & Found' },
    primaryAttributes: [
      { key: 'status',    label: 'Status',    type: 'select', required: true, options: ['Lost', 'Found'] },
      { key: 'item_type', label: 'Item Type', type: 'select', required: true, options: ['Pet', 'Phone / Tablet', 'Keys', 'Wallet / Purse', 'Bag', 'Bicycle', 'Jewellery / Watch', 'ID / Documents', 'Glasses', 'Clothing', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'date_occurred', label: 'Date', type: 'text', placeholder: 'e.g. 15 May 2026' },
    ],
  },

  'rideshare-pooling': {
    showPrice: true, showPriceType: false, showCondition: false, showShipping: false,
    priceLabel: 'Contribution per seat (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. Daily commute — Leeds to Manchester, M62, 8am',
    descriptionPlaceholder: 'Describe the journey — pickup point, drop-off, any requirements (non-smoker, etc.)…',
    presetAttrs: { community_type: 'Carpool / Rideshare' },
    primaryAttributes: [
      { key: 'from_location', label: 'From',           type: 'text',   required: true, placeholder: 'e.g. Leeds city centre' },
      { key: 'to_location',   label: 'To',             type: 'text',   required: true, placeholder: 'e.g. Manchester Piccadilly' },
      { key: 'seats',         label: 'Seats Available', type: 'select', options: ['1', '2', '3', '4'] },
    ],
    secondaryAttributes: [
      { key: 'departure',  label: 'Departure Date / Schedule', type: 'text',   placeholder: 'e.g. Mon–Fri 8am, or 1st June' },
      { key: 'recurring',  label: 'Journey Type',              type: 'select', options: ['One-off', 'Daily / Regular', 'Weekly', 'Flexible'] },
    ],
  },

  // ── Services ──────────────────────────────────────────────────────────────
  'tradesmen': {
    showPrice: true, showPriceType: false, showCondition: false, showShipping: false,
    priceLabel: 'Rate / Price (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. Qualified electrician — 24hr callout, London & SE',
    descriptionPlaceholder: 'Describe your service — qualifications, area covered, what\'s included, how to book…',
    presetAttrs: { service_type: 'Building & Trades' },
    primaryAttributes: [
      { key: 'trade_type',    label: 'Trade',         type: 'select', required: true, options: ['Plumbing', 'Electrical', 'Gas & Heating / Boiler', 'Carpentry & Joinery', 'Plastering', 'Painting & Decorating', 'Roofing', 'Flooring', 'Tiling', 'Bricklaying & Masonry', 'General Building', 'Handyman', 'Locksmith', 'Other'] },
      { key: 'work_location', label: 'Work Type',     type: 'select', options: ['On-site only', 'On-site or remote'] },
    ],
    secondaryAttributes: [
      { key: 'rate_period',      label: 'Rate Type',    type: 'select', options: ['Per hour', 'Per day', 'Fixed price', 'Price on application'] },
      { key: 'experience_years', label: 'Experience',   type: 'select', options: ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10+ years'] },
      { key: 'qualifications',   label: 'Qualifications', type: 'text', placeholder: 'e.g. City & Guilds, Gas Safe, NICEIC' },
    ],
  },

  'tutors': {
    showPrice: true, showPriceType: false, showCondition: false, showShipping: false,
    priceLabel: 'Hourly Rate (£)',
    conditionOptions: [],
    titlePlaceholder: 'e.g. Maths & Further Maths A-Level tutor — online',
    descriptionPlaceholder: 'Describe your tutoring — experience, qualifications, teaching style, how sessions work…',
    presetAttrs: { service_type: 'Tutoring & Teaching' },
    primaryAttributes: [
      { key: 'subject',       label: 'Subject',         type: 'text',   required: true, placeholder: 'e.g. Maths, English, Physics' },
      { key: 'level',         label: 'Level',           type: 'select', options: ['Primary (KS1 / KS2)', 'Secondary (KS3 / KS4)', 'GCSE', 'A-Level / Sixth Form', 'University', 'Adult / Professional', 'All levels'] },
      { key: 'tutor_format',  label: 'Format',          type: 'select', options: ['In-person', 'Online', 'Both online & in-person'] },
    ],
    secondaryAttributes: [
      { key: 'experience_years', label: 'Experience', type: 'select', options: ['Less than 1 year', '1–3 years', '3–5 years', '5+ years', '10+ years'] },
      { key: 'dbs_checked',      label: 'DBS Checked',  type: 'select', options: ['Yes – enhanced DBS', 'Yes – standard DBS', 'No'] },
    ],
  },

  // ── Kids & Baby ───────────────────────────────────────────────────────────
  'prams-pushchairs': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: false,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. iCandy Peach 6 travel system — graphite, nearly new',
    descriptionPlaceholder: 'Describe the item — what\'s included (car seat, carrycot, accessories), age, reason for selling…',
    primaryAttributes: [
      { key: 'pram_type', label: 'Type', type: 'select', required: true, options: ['Travel System', 'Pushchair / Stroller', 'Pram / Carrycot', 'Tandem / Double', 'Buggy Board', 'Jogging Pushchair', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'brand',          label: 'Brand',            type: 'text',   placeholder: 'e.g. iCandy, Bugaboo, Silver Cross' },
      { key: 'suitable_from',  label: 'Suitable From',    type: 'select', options: ['Newborn', '6 months+', '1 year+'] },
      { key: 'folds_compact',  label: 'Folds to Compact', type: 'select', options: ['Yes', 'No'] },
    ],
  },

  'kids-equipment': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: false,
    priceLabel: 'Price (£)',
    conditionOptions: PRODUCT_CONDITIONS,
    titlePlaceholder: 'e.g. Graco high chair — adjustable, easy clean',
    descriptionPlaceholder: 'Describe the item — age suitability, brand, any wear, what\'s included…',
    primaryAttributes: [
      { key: 'equipment_type', label: 'Item Type', type: 'select', required: true, options: ['High Chair', 'Car Seat / Booster', 'Baby Monitor', 'Baby Bouncer / Swing', 'Baby Walker', 'Cot / Crib / Bed', 'Moses Basket & Stand', 'Baby Bath', 'Baby Gate / Stair Gate', 'Play Mat / Gym', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'brand',         label: 'Brand',         type: 'text',   placeholder: 'e.g. Graco, Chicco, BabyBjörn' },
      { key: 'suitable_age',  label: 'Suitable Age',  type: 'text',   placeholder: 'e.g. 0–3 years, Newborn to 13kg' },
    ],
  },

  // ── Business & Industrial ─────────────────────────────────────────────────
  'machinery': {
    showPrice: true, showPriceType: true, showCondition: true, showShipping: false,
    priceLabel: 'Price (£)',
    conditionOptions: ALL_CONDITIONS,
    titlePlaceholder: 'e.g. JCB 3CX backhoe loader 2018 — low hours',
    descriptionPlaceholder: 'Describe the machine — hours used, service history, any faults, reason for selling…',
    primaryAttributes: [
      { key: 'machine_type', label: 'Machine Type', type: 'select', required: true, options: ['Forklift', 'Excavator / Digger', 'Generator', 'Compressor', 'Welder', 'Lathe / CNC Machine', 'Concrete Mixer', 'Scaffolding', 'Agricultural Machine', 'Other'] },
    ],
    secondaryAttributes: [
      { key: 'brand',      label: 'Brand / Make',     type: 'text',   placeholder: 'e.g. JCB, Caterpillar, Komatsu' },
      { key: 'year',       label: 'Year',             type: 'number', placeholder: 'e.g. 2018', min: 1970, max: new Date().getFullYear() + 1 },
      { key: 'hours_used', label: 'Hours Used',       type: 'number', placeholder: 'e.g. 2500' },
    ],
  },
}

// ─── Public API ────────────────────────────────────────────────────────────────

export function getCategoryConfig(parentSlug: string, subSlug?: string): CategoryConfig {
  if (subSlug && SUB[subSlug]) return SUB[subSlug]
  return TOP_LEVEL[parentSlug] ?? TOP_LEVEL['other']
}

export function getAllAttributeFields(config: CategoryConfig): AttributeField[] {
  return [...config.primaryAttributes, ...config.secondaryAttributes]
}
