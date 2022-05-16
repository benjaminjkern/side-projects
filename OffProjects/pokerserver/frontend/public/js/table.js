(() => {
    const getPlayersList = (sortingFunc = () => 0) => {
        fetch("/player")
            .then((res) => {
                if (res.status !== 200) throw res;
                return res.json();
            })
            .then(({ players }) => {
                const sortedPlayers = Object.keys(players)
                    .map((name) => players[name])
                    .sort(sortingFunc);
                for (const player of sortedPlayers) {
                    addTemplate(table, "html/player.html", player);
                }
            })
            .catch(console.error);
    };

    window.onload = () => {
        const table = document.getElementById("table");
        addTemplate(table, "html/player.html", {
            name: "Name",
            profit: "Profit",
            score: "Score",
            games: "Games",
            wins: "Wins",
            draws: "Draws",
            losses: "Losses",
            besthand1: "Best Hand #1",
            besthand2: "Best Hand #2",
            besthand3: "Best Hand #3",
        });
        getPlayersList((a, b) => b.profit - a.profit);
    };
})();
