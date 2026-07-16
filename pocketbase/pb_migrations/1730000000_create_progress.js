/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = new Collection({
      type: 'base',
      name: 'progress',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        {
          type: 'text',
          name: 'key',
          required: true,
          min: 1,
          max: 64,
        },
        {
          type: 'json',
          name: 'data',
          required: true,
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_progress_key ON progress (`key`)',
      ],
    })

    app.save(collection)

    const settings = app.settings()
    settings.meta.appName = 'Interview Prep Tracker'
    app.save(settings)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('progress')
      app.delete(collection)
    } catch {
      // already removed
    }
  },
)
