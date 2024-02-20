const GAME_STAGE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]


const view = {
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}">
      <p>${number}</p>
    `
  },
  transformNumber (number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  flipCards(...cards) {
    cards.map(card => {
      // 如果是背面
      if (card.classList.contains('back')) {
        // 回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },
  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend',event => {event.target.classList.remove('wrong')},{once:true})
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p>Complete!</p>
    <p>Score: ${model.score}</p>
    <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const model = {
  revealCards: [],

  isRevealedCardsMatched() {
    return this.revealCards[0].dataset.index % 13 === this.revealCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0
}

const controller = {
  currentState: GAME_STAGE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  // 依照不同的遊戲狀態，做不同的行為
  dispatchCardAction(card) {
    if(!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STAGE.FirstCardAwaits:
        view.flipCards(card)
        model.revealCards.push(card)
        this.currentState = GAME_STAGE.SecondCardAwaits
        return
      case GAME_STAGE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealCards.push(card)
        // 判斷是否成功
        if (model.isRevealedCardsMatched()) {
          //  配對正確
          view.renderScore((model.score += 10))
          this.currentState = GAME_STAGE.CardsMatched
          view.pairCards(...model.revealCards)
          model.revealCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STAGE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STAGE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STAGE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealCards)
          setTimeout(this.resetCards, 1000)
        }
        return
    }
  },
  resetCards() {
    view.flipCards(...model.revealCards)
    model.revealCards = []
    controller.currentState = GAME_STAGE.FirstCardAwaits
  }
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()

// Node List
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event =>{
    controller.dispatchCardAction(card)
  })
})

