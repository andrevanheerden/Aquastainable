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

Legacy records can be enriched with `POST /fish/enrich/:fishId` using `{ "userId": "..." }`. This updates every matching record owned by that user, including species ID `173412` when its fish detail page is opened.

## Sources

- iNaturalist API: `https://api.inaturalist.org/v1/taxa/autocomplete`
- GBIF API: `https://api.gbif.org/v1`
- Wikimedia Commons API: `https://commons.wikimedia.org/w/api.php`