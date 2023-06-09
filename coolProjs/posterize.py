import numpy as np
from skimage import io, color, exposure
import math


class ClassTree:

    def __init__(self, my_list, depth):
        if my_list.size == 0:
            self.num = 0
        else:
            self.num = sum(my_list) / my_list.size

        if depth == 0:
            self.left = None
            self.right = None
        else:
            self.left = ClassTree(
                np.array([a for a in my_list if a < self.num]), depth-1)
            self.right = ClassTree(
                np.array([a for a in my_list if a > self.num]), depth-1)

    def classify(self, test_num):
        if self.left == None and self.right == None or test_num == int(self.num):
            return int(self.num)
        elif test_num < self.num:
            return self.left.classify(test_num)
        else:
            return self.right.classify(test_num)


def posterize(image, n, bg=None):
    yeuh = [b for b in image.reshape(image.size//3, 3) if list(b) != bg]

    r = np.sort([a[0] for a in yeuh], axis=None)
    g = np.sort([a[1] for a in yeuh], axis=None)
    b = np.sort([a[2] for a in yeuh], axis=None)

    r_tree = ClassTree(r, n)
    g_tree = ClassTree(g, n)
    b_tree = ClassTree(b, n)

    def kevin(my_list):
        if list(my_list) == bg:
            return bg

        return [
            r_tree.classify(my_list[0]),
            g_tree.classify(my_list[1]),
            b_tree.classify(my_list[2]),
        ]

    return np.array([[kevin(a) for a in b] for b in image])


def randomize(image, n):
    color_list = np.random.randint(256, size=(n, 3))
    print(color_list)

    def dist(a, b):
        return np.sqrt(sum((a - b)**2))

    def kevin(my_color):
        return color_list[np.argmin([dist(my_color[0:3], c) for c in color_list])]

    return np.array([[kevin(a) for a in b] for b in image])


image = io.imread('eye2.png')
image2 = randomize(image, 10)


io.imshow(image2)
io.show()
