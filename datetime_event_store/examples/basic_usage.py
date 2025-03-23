import datetime
from datetime_event_store import DatetimeEventStore

store = DatetimeEventStore(
    connection_string="mongodb://localhost:27017/",
    db_name="my_events_db",
    collection_name="datetime_events"
)

event1 = store.store_event(
    at=datetime.datetime(2023, 5, 15, 14, 30),
    name="Réunion d'équipe",
    importance="haute"
)

event2 = store.store_event(
    at=datetime.datetime(2023, 5, 20),
    name="Livraison du projet",
    importance="critique"
)

print(f"Événement créé avec ID: {event1.id}")

start = datetime.datetime(2023, 5, 1)
end = datetime.datetime(2023, 5, 31)

print("\nÉvénements de mai 2023:")
for event in store.get_events(start, end):
    print(f"- {event.at}: {event.name} (Importance: {event.importance})")

updated_event = store.update_event(
    event_id=event1.id,
    name="Réunion d'équipe mensuelle",
    importance="normale"
)

if updated_event:
    print(f"\nÉvénement mis à jour: {updated_event}")

count = store.count_events(start, end)
print(f"\nNombre d'événements en mai 2023: {count}")

store.close()