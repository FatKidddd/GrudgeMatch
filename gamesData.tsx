export interface GameDataType {
  id: string;
  name: string;
  imageName: string;
};

export interface GamesDataType {
  golf: GameDataType
};

const gamesData: GamesDataType = {
  golf: {
    id: "golf",
    name: "Golf",
    imageName: "golf_bg.jpg"
  },
};

export default gamesData;