sqrt = fn: Num x, (Num epsilon or 1e-15) | epsilon > 0
    | x < 0 -> 1i * sqrt(-x)
    | ->
        a = 0
        b = Num.MAXVALUE

        while b - a > epsilon * a:
            c = (b + a) / 2

            cases c ^ 2:
                $ == x -> return c
                $ > x -> b = c
                true -> a = c
        
        return a

cbrt = fn: Num x, Num epsilon ?= 1e-15 | epsilon > 0 ->
    a = -Num.MAXVALUE
    b = Num.MAXVALUE

    while b - a > epsilon * a:
        c = (b + a) / 2

        cases c ^ 3:
            $ == x -> return c
            $ > x -> b = c
            true -> a = c
    
    return a