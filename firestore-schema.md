# Firestore Database Schema for Wedding Website Application

This document defines the Firestore database structure for the iWedPlan wedding website application.

## Collections and Documents

### `users` Collection

Main collection containing wedding website data. Each document represents one wedding website.

**Document ID format**: `{subdomain}_{dd}_{mm}_{yy}`
Example: `hieulinh_16_04_25`

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Document ID, same as the document ID |
| `subdomain` | String | Unique subdomain for the wedding website |
| `groomName` | String | Name of the groom |
| `brideName` | String | Name of the bride |
| `description` | String (optional) | Description of the wedding |
| `subId` | String (optional) | Subscription ID for premium features |
| `createdAt` | Timestamp | When the wedding website was created |
| `subAt` | Timestamp (optional) | When the user subscribed to premium |
| `subExp` | Timestamp (optional) | When the premium subscription expires |
| `template` | String | Template ID for the wedding website (default, elegant, modern) |
| `flowerFrame` | String (optional) | ID of the selected flower frame (rose, lily, orchid) |
| `heroImageUrl` | String (optional) | URL to the hero image in Firebase Storage |
| `color` | String (optional) | Selected color theme (pink, blue, purple, gold, custom) |
| `customColor` | String (optional) | Hex code for custom color if color="custom" |
| `eventDate` | Timestamp (optional) | Main wedding ceremony date |
| `location` | String (optional) | Main wedding ceremony location |
| `rsvpEnabled` | Boolean (optional) | Whether RSVP is enabled |
| `guestListEnabled` | Boolean (optional) | Whether guest list management is enabled |
| `carouselImages` | Array<String> (optional) | Array of image URLs for the carousel |

### Sub-collections under each wedding document

#### `events` Sub-collection

Wedding events associated with this wedding website.

**Document ID**: Auto-generated

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Auto-generated ID |
| `title` | String | Event title (e.g., "Wedding Ceremony", "Reception") |
| `description` | String (optional) | Description of the event |
| `startDate` | Timestamp | Event start date and time |
| `endDate` | Timestamp (optional) | Event end date and time |
| `location` | String | Event location |
| `address` | String (optional) | Detailed address |
| `mapUrl` | String (optional) | Google Maps URL |
| `order` | Number | Display order in the events list |

#### `guests` Sub-collection

Guest list for the wedding.

**Document ID**: Auto-generated

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Auto-generated ID |
| `name` | String | Guest's full name |
| `email` | String (optional) | Guest's email |
| `phone` | String (optional) | Guest's phone number |
| `rsvpStatus` | String | "pending", "attending", "declined" |
| `plusOne` | Boolean | Whether the guest can bring a plus one |
| `plusOneName` | String (optional) | Name of the plus one |
| `group` | String (optional) | Guest group (e.g., "Family", "Friends") |
| `notes` | String (optional) | Additional notes |
| `dietaryRestrictions` | String (optional) | Dietary restrictions |
| `createdAt` | Timestamp | When the guest was added |
| `updatedAt` | Timestamp | When the guest information was last updated |

#### `wishes` Sub-collection

Wishes and congratulations from visitors.

**Document ID**: Auto-generated

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Auto-generated ID |
| `name` | String | Name of the person leaving the wish |
| `message` | String | The wish message |
| `createdAt` | Timestamp | When the wish was created |
| `approved` | Boolean | Whether the wish is approved and displayed |
| `relationship` | String (optional) | Relationship to the couple |

#### `gallery` Sub-collection

Photo gallery images.

**Document ID**: Auto-generated

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Auto-generated ID |
| `imageUrl` | String | URL to the image in Firebase Storage |
| `thumbnail` | String (optional) | URL to thumbnail image |
| `caption` | String (optional) | Image caption |
| `order` | Number (optional) | Display order in the gallery |
| `category` | String (optional) | Image category (e.g., "Engagement", "Ceremony") |
| `uploadedAt` | Timestamp | When the image was uploaded |

#### `stories` Sub-collection

Love story timeline elements.

**Document ID**: Auto-generated

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Auto-generated ID |
| `title` | String | Story title (e.g., "How We Met") |
| `description` | String | Story details |
| `date` | Timestamp | When the story event occurred |
| `imageUrl` | String (optional) | URL to an image for this story |
| `order` | Number | Display order in the timeline |

#### `gifts` Sub-collection

Gift registry or cash gift information.

**Document ID**: Auto-generated

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Auto-generated ID |
| `type` | String | "bank", "registry", "crypto" |
| `title` | String | Title for this gift option |
| `description` | String (optional) | Description of the gift option |
| `bankName` | String (optional) | Bank name if type="bank" |
| `accountNumber` | String (optional) | Account number if type="bank" |
| `accountName` | String (optional) | Account name if type="bank" |
| `registryUrl` | String (optional) | Registry URL if type="registry" |
| `cryptoAddress` | String (optional) | Crypto address if type="crypto" |
| `cryptoType` | String (optional) | Cryptocurrency type if type="crypto" |
| `order` | Number | Display order in the gifts section |

## Storage Structure

Firebase Storage is organized as follows:

```
weddings/
  {wedding_id}/
    hero-image.jpg         # Main hero image
    gallery/               # Gallery images
      {image_id}.jpg
    stories/               # Story images
      {story_id}.jpg
    profiles/              # Bride and groom profile images
      bride.jpg
      groom.jpg
```

## Security Rules

Security rules ensure:

1. Public read access to wedding website data
2. Write access only to authenticated owners
3. Subdomain uniqueness checks
4. Validation of required fields

See `firestore.rules` and `storage.rules` for implementation details. 