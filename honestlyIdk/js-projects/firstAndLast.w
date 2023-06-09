firstAndLast = fn:
    [Int] arr, Int x -> (first arr x, last arr x)

first = fn:
    [], Int x -> -1
    [Int] arr, Int x
        | x == arr[0] -> 0
        | f := first arr[1..] x >= 0 -> 1 + f
        | -> -1

last = fn:
    [], Int x -> -1
    [Int] arr, Int x
        | x == arr[-1] -> len arr - 1
        | -> last arr[0..(len arr - 2)] x




firstAndLast = fn:
    [Int] arr, Int x ->
        length = len arr
        first = 0

        while first < length:
            if arr[first] == x:
                break
            first += 1
        
        if first == length:
            return (-1, -1)

        last = length - 1
        
        while last >= first:
            if arr[last] == x:
                break
            last -= 1

        return (first, last)


# This one is my favorite
firstAndLast = fn:
    [Int] arr, Int x, (Int first, Int last)
        | first == last and arr[first] != x -> (-1, -1)
        | arr[first] == arr[last] == x -> (first, last)
        | arr[first] == x -> firstAndLast arr x (first, last - 1)
        | arr[last] == x -> firstAndLast arr x (first + 1, last)
        | -> firstAndLast arr x (first + 1, last - 1)
    [Int] arr, Int x -> firstAndLast arr x (0, len arr - 1)

firstAndLast [2, 3, 8, 9, 8, 1] 8
firstAndLast [2, 3, 8, 9, 8, 1] 8 (0, 5)
firstAndLast [2, 3, 8, 9, 8, 1] 8 (1, 4)
firstAndLast [2, 3, 8, 9, 8, 1] 8 (2, 4)

# New best
firstAndLast = fn:
    [Int] arr, Int x, (Int first, Bool firstDone), (Int last, Bool lastDone)
        | firstDone && lastDone -> (first, last)
        | firstDone || arr[first] == x -> firstAndLast arr x (first, true) (last - 1, false)
        | 
    [Int] arr, Int x -> firstAndLast arr x (0, false) (len arr -1, false)
