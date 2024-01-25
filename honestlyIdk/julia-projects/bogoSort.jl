function is_sorted(arr)
    n = length(arr)
    for i in 2:n
        if arr[i] < arr[i-1]
            return false
        end
    end
    return true
end

function shuffle(arr)
    n = length(arr)
    for i in n:-1:2
        j = rand(1:i)  # Random index from 1 to i
        arr[i], arr[j] = arr[j], arr[i]  # Swap elements at indices i and j
    end
end

function bogosort(arr)
    while !is_sorted(arr)
        shuffle(arr)
    end
    return arr
end

# Example usage
arr = [4, 2, 7, 1, 9, 8, 12, 13, 20, 0, 1, 10]
println("Unsorted array: ", arr)
sorted_arr = bogosort(arr)
println("Sorted array: ", sorted_arr)