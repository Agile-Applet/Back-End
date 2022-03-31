/* Texas Holdem Game Room Player */

class Player {

    constructor(name, money, avatar) {
        this.name = name;
        this.money = money;
        this.avatar = avatar;
    }

    getName = () => (this.name);
    getMoney = () => (this.money);
    setMoney = (amount) => this.money(amount);
    getAvatar = () => (this.avatar);

}

module.exports = { Player }