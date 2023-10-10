const GAMES = `
# Bancho
Wacky Bancho
Bancho Fellas
Chiraq Bancho
49 Bancho
Blue Bancho

# Copper
49 Copper
Copper Blue
Copper Ted
Cozy Copper
Copper Fellas

# Cozy
Blue Cozy
Cozy Ted
Cozy Fellas
# Cozy Copper
Epic Cozy

# Wacky
# Wacky Bancho
Chiraq Wacky
49 Wacky
Blue Wacky
Wacky Ted

# Chiraq
Epic Chiraq
# Chiraq Wacky
# Chiraq Bancho
Chiraq Fellas
Chiraq 49

# 49
# 49 Copper
49 Epic
# 49 Wacky
# 49 Bancho
# Chiraq 49

# Ted
Ted Fellas
# Cozy Ted
# Copper Ted
Epic Ted
# Wacky Ted

# Fellas
# Ted Fellas
# Bancho Fellas
# Fellas Cozy
# Chiraq Fellas
# Copper Fellas

# Blue
# Blue Cozy
# Copper Blue
Epic Blue
# Blue Wacky
# Blue Bancho

# Epic
# Epic Chiraq
# 49 Epic
# Epic Blue
# Epic Ted
# Epic Cozy
`
    .split("\n")
    .filter((line) => !line.match(/^(\s*|#.*)$/))
    .map((line) => {
        const split = line.split(" ");
        return { winner: split[0], loser: split[1] };
    });

console.log(GAMES);

const PLAYERS = GAMES.reduce(
    (p, { winner, loser }) => ({ ...p, [winner]: true, [loser]: true }),
    0
);

console.log(PLAYERS);
