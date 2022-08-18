console.log(
    Array(5)
        .fill()
        .flatMap((_1, sx) =>
            Array(8)
                .fill()
                .map((_2, sy) => [sx, sy])
        )
);
