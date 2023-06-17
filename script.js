(function ($, win) {
  const $doc = $(document);
  const $wrapperSelectTypePlayer = $('[data-game-wrapper="select-type-player"]');
  const $wrapperBoardGame = $('[data-game-wrapper="board"]');
  const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]];

  let AIMove;
  let liveBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  let cpuIcon = 'X';
  let playerIcon = 'O';

  // Events
  $doc.on('click', '[data-game-action="select-player"]', selectedPlayer);
  $doc.on('click', '[data-game-action="select-type-player"]', selectedOptionPlayer);

  // Functions
  function selectedPlayer() {
    $wrapperSelectPlayer.addClass('is-hidden');
    $wrapperSelectTypePlayer.removeClass('is-hidden');
  }

  function selectedOptionPlayer() {
    const $el = $(this);
    const option = getValueOptionByElement($el);

    setPlayersOption(option);
    showTicTacToe();
    startNewGame();
  }

  function getValueOptionByElement($el) {
    return $el.data('game-player-option');
  }

  function showTicTacToe() {
    $wrapperSelectTypePlayer.addClass('is-hidden');
    $wrapperBoardGame.removeClass('is-hidden');
  }

  function setPlayersOption(option) {
    setPlayerOption(option);
    setCpuOption(option);
  }

  function setPlayerOption(option) {
    playerIcon = option === 'X' ? 'X' : 'O';
  }

  function setCpuOption(option) {
    cpuIcon = option === 'X' ? 'O' : 'X';
  }

  //UI
  function renderBoard(board) {
    board.forEach(function (el, i) {
      var squareId = '#' + i.toString();
      if (el === -1) {
        $(squareId).text(playerIcon);
      } else if (el === 1) {
        $(squareId).text(cpuIcon);
      }
    });

    $('.square:contains(X)').addClass('x-marker');
    $('.square:contains(O)').addClass('o-marker');
  }

  function animateWinLine() {
    var idxOfArray = winningLines.map(function (winLines) {
      return winLines.map(function (winLine) {
        return liveBoard[winLine];
      }).reduce(function (prev, cur) {
        return prev + cur;
      });
    });

    const line = idxOfArray.indexOf(Math.abs(3));
    const squaresToAnimate = winningLines[line];
    squaresToAnimate.forEach(function (el) {
      $('#' + el).addClass('flash');
    });
  }

  function endGameMessage() {
    const result = checkVictory(liveBoard);
    const message = result === 'win' ? 'You Lost' : "It's a draw";
    console.log(result);
    cleanGame();
    console.log(cpuIcon);
    if (result === 'win') {
      if (cpuIcon === 'X') {
        let total = $('[data-game-score="x-win"]').text();
        $('[data-game-score="x-win"]').text(++total);
      } else {
        let total = $('[data-game-score="o-win"]').text();
        $('[data-game-score="o-win"]').text(++total);
      }
    } else
    {
      let total = $('[data-game-score="draws"]').text();
      $('[data-game-score="draws"]').text(++total);
    }

    setTimeout(() => {
      startNewGame();
    }, 700);
  }

  //GAMEPLAY
  function startNewGame() {
    liveBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    renderBoard(liveBoard);
    playerTakeTurn();
  }

  function playerTakeTurn() {
    $('.square:empty').hover(function () {
      $(this).text(playerIcon).css('cursor', 'pointer');
    }, function () {
      $(this).text('');
    });

    $('.square:empty').click(function () {
      $(this).css('cursor', 'default');
      liveBoard[parseInt($(this).attr('id'))] = -1;
      renderBoard(liveBoard);

      if (checkVictory(liveBoard)) {
        setTimeout(endGameMessage, checkVictory(liveBoard) === 'win' ? 700 : 100);
      } else {
        setTimeout(aiTakeTurn, 100);
      }
      $('.square').off();
    });
  }

  function aiTakeTurn() {
    miniMax(liveBoard, 'aiPlayer');
    liveBoard[AIMove] = 1;
    renderBoard(liveBoard);
    if (checkVictory(liveBoard)) {
      animateWinLine();
      setTimeout(endGameMessage, checkVictory(liveBoard) === 'win' ? 700 : 100);
    } else {
      playerTakeTurn();
    }
  }

  //UTILITIES
  function checkVictory(board) {
    const squaresInPlay = board.reduce(function (prev, cur) {
      return Math.abs(prev) + Math.abs(cur);
    });

    const outcome = winningLines.map(function (winLines) {
      return winLines.map(function (winLine) {
        return board[winLine];
      }).reduce(function (prev, cur) {
        return prev + cur;
      });
    }).filter(function (winLineTotal) {
      return Math.abs(winLineTotal) === 3;
    });

    if (outcome[0] === 3) {
      return 'win';
    } else if (outcome[0] === -3) {
      return 'lose';
    } else if (squaresInPlay === 9) {
      return 'draw';
    } else {
      return false;
    }
  }

  function availableMoves(board) {
    return board.map(function (el, i) {
      if (!el) {
        return i;
      }
    }).filter(function (e) {
      return typeof e !== "undefined";
    });
  }

  function cleanGame() {
    const $el = $('.square');
    $el.
    removeClass('o-marker').
    removeClass('x-marker').
    text('');
  }

  //AI
  //minimax algorithm - explanation here: http://http://neverstopbuilding.com/minimax
  function miniMax(state, player) {
    let result = checkVictory(state);
    if (result === 'win') {
      return 10;
    }
    if (result === 'lose') {
      return -10;
    }
    if (result === 'draw') {
      return 0;
    }

    let moves = [];
    let scores = [];
    //for each of the available squares: recursively make moves and push the score + accompanying move to the moves + scores array
    availableMoves(state).forEach(function (square) {
      state[square] = player === 'aiPlayer' ? 1 : -1;
      scores.push(miniMax(state, player === 'aiPlayer' ? 'opponent' : 'aiPlayer'));
      moves.push(square);
      state[square] = 0;
    });

    //calculate and return the best score gathered from each of the available moves. track the best movein the AIMove variable
    if (player === 'aiPlayer') {
      AIMove = moves[scores.indexOf(Math.max.apply(Math, scores))];
      return Math.max.apply(Math, scores);
    } else {
      AIMove = moves[scores.indexOf(Math.min.apply(Math, scores))];
      return Math.min.apply(Math, scores);
    }
  }

  // 
  renderBoard(liveBoard);
})(jQuery, window);