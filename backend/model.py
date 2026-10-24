class CaffeineMonitor:
    def __init__(self, bedtime):
        self.bedtime = bedtime
        self.cups = [] # array of tuples (time_ingested, amount)
        self.threshold = 60

    def change_bedtime(self, new_bedtime):
        self.bedtime = new_bedtime
    def drink_cup(self, time_ingested, amount):
        self.cups.append((time_ingested, amount))

    def calculate_caffeine(self, hours_passed, original_amount):
        return original_amount * (0.5 ** (hours_passed / 5))
    def is_safe_amount(self, cups):
        total = 0
        for (time_ingested, amount) in cups:
            total += self.calculate_caffeine(self.bedtime - time_ingested, amount)
        print(total)
        return total <= self.threshold
    def has_drunk_safe_amount(self):
        return self.is_safe_amount(self.cups)
    def can_drink_cup(self, time_ingested, amount):
        return self.is_safe_amount(self.cups + [(time_ingested, amount)])

person = CaffeineMonitor(24)
person.drink_cup(8, 180)
person.drink_cup(11, 180)
print(person.has_drunk_safe_amount())
# print(total_caffeine([(8, 180), (11, 180)], 24))
