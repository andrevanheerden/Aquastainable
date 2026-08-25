# Fish Data Architecture

Fish data is fetched on demand. The backend does not keep a global fish catalog.

## Providers

- `providers/inaturalist.js`: searches common and scientific names and returns fish taxonomy plus image URLs.
- `providers/gbif.js`: available for taxonomy matching and validation when needed.
- `providers/wikimedia.js`: finds a fallback image and license metadata when iNaturalist has no image.

## Service

`service.js` combines provider responses into the frontend `FishSpecies` shape. Empty care fields are intentional; the service never invents pH, temperature, diet, or compatibility values.

## User storage

The `/fish/add` route stores the selected fish snapshot and the AI care profile under the user's tank:

```text
tanks/{tankId}/fish/{fishDocumentId}
```

The saved record includes the API names, image URL, image source, license, user's school size, description, best temperature, pH range, minimum water space, feed type, adult length, temperament, minimum group size, and profile confidence. It is not a shared fish catalog.

## Individual fish

Individual fish profiles are stored beneath their parent fish record:

```text
tanks/{tankId}/fish/{fishDocumentId}/individualFish/{individualFishId}
```

The individual record stores `parentFishId`, `tankId`, `imageUrl`, `name`, `age`, `health`, `story`, `createdAt`, and `updatedAt`. New images are uploaded to Cloudinary under `aquastainable/individual-fish` and only the returned URL is stored.

CRUD endpoints, all scoped with the parent tank and fish ownership check:

- `POST /fish/{tankId}/{fishDocumentId}/individual-fish` with `{ userId, image, name, age, health, story, schoolStatus }`, where `schoolStatus` is `new` or `existing`
- `GET /fish/{tankId}/{fishDocumentId}/individual-fish?userId={userId}`
- `PATCH /fish/{tankId}/{fishDocumentId}/individual-fish/{individualFishId}` with any editable fields
- `DELETE /fish/{tankId}/{fishDocumentId}/individual-fish/{individualFishId}` with `{ userId }`

Legacy records can be enriched with `POST /fish/enrich/:fishId` using `{ "userId": "..." }`. This updates every matching record owned by that user, including species ID `173412` when its fish detail page is opened.

## Aquarium plant search

Plant search uses iNaturalist's taxonomy API filtered to `Plantae`. iNaturalist supplies names and image/source metadata; aquarium-specific care and compatibility data should be added through the AI care profile or a curated application layer rather than inferred from general plant taxonomy.

Plant endpoints:

- `GET /plants/search?query={query}`
- `POST /plants/add` with `{ userId, tankId, plantId, name, scientificName, image, imageSourceUrl, imageLicense, source }`

## Sources

- iNaturalist API: `https://api.inaturalist.org/v1/taxa/autocomplete`
- GBIF API: `https://api.gbif.org/v1`
- Wikimedia Commons API: `https://commons.wikimedia.org/w/api.php`