export interface GameDataType {
  id: string;
  name: string;
  imagePath: any;
};

export interface GamesDataType {
  golf: GameDataType
};

const gamesData: GamesDataType = {
  golf: {
    id: "golf",
    name: "Golf",
    imagePath: require("./assets/images/games/golf_bg.png")
  },
};

export default gamesData;