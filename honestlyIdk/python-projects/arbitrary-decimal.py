class Number:
    def __init__(self, input):
        yeuh = str(input).split(".")
        self.left = int(yeuh[0])
        self.right = 0 if len(yeuh) == 1 else int(yeuh[1][::-1])

    def __str__(self):
        return f'{self.left}.{str(self.right)[::-1]}'

    def __add__(self, other):
        my_dec = str(self.right)
        o_dec = str(other.right)
        longer = max(len(my_dec), len(o_dec))

        carry, t_dec = divmod(int(my_dec.zfill(longer)) +
                              int(o_dec.zfill(longer)), 10**longer)
        t_dec = str(t_dec).zfill(longer)[::-1]

        return Number(f'{self.left + other.left + carry}.{t_dec}')

    @property
    def neg(self):
        return Number()

    def __sub__(self, other):
        return self + other.neg

    def __eq__(self, other):
        return self.left == other.left and self.right == other.right


print(Number(1.20418250394123905102358325623465923467982346723495237458234759238745923457)-Number(0.2))
