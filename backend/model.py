from datetime import datetime

class CaffeineMonitor:
    # times are stored as tuples (hour, minute)
    def __init__(self, bedtime):
        self.bedtime = bedtime
        self.cups = [] # array of tuples (time_ingested, amount)
        self.threshold = 60

    def change_bedtime(self, new_bedtime):
        self.bedtime = new_bedtime
    def drink_cup(self, time_ingested, amount):
        self.cups.append((time_ingested, amount))

    def timestamp_to_minutes(self, timestamp):
        return timestamp[0] * 60 + timestamp[1]

    def calculate_current_caffeine(self):
        now = datetime.now()
        now_minutes = self.timestamp_to_minutes((now.hour, now.minute))
        total = 0
        for (time_ingested, amount) in self.cups:
            time_ingested_minutes = self.timestamp_to_minutes(time_ingested)
            hours_passed = ((now_minutes - time_ingested_minutes) % 1440) / 60
            total += self.calculate_caffeine(hours_passed, amount)
        return round(total)

    def calculate_caffeine(self, hours_passed, original_amount):
        return original_amount * (0.5 ** (hours_passed / 5))

    def is_safe_amount(self, cups):
        total = 0
        for (time_ingested, amount) in cups:
            hours_until_bedtime = ((self.timestamp_to_minutes(self.bedtime) - self.timestamp_to_minutes(time_ingested)) % 1440) / 60
            total += self.calculate_caffeine(hours_until_bedtime, amount)
        print(round(total), "mg at bedtime")
        return total <= self.threshold
    def has_drunk_safe_amount(self):
        return self.is_safe_amount(self.cups)
    def can_drink_cup(self, time_ingested, amount):
        return self.is_safe_amount(self.cups + [(time_ingested, amount)])

# person = CaffeineMonitor((3, 0))
# person.drink_cup((15, 0), 48)
# person.drink_cup((17, 0), 48)
# print(person.calculate_current_caffeine(), "mg")
