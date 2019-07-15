using System;
using System.Collections.Generic;
using System.Linq;
using Uno.Contants;
using Uno.Enums;

namespace Uno.Models
{
    public class Game
    {
        public Deck Deck { get; set; }
        public List<Player> Players { get; set; }
        public List<Spectator> Spectators { get; set; }
        public List<Card> DiscardedPile { get; set; }
        public GameSetup GameSetup { get; set; }
        public Direction Direction { get; set; }
        public LastCardPlayed LastCardPlayed { get; set; }
        public Player PlayerToPlay { get; set; }
        public bool GameStarted { get; set; }
        public bool GameEnded { get; set; }

        public Game(GameSetup gameSetup)
        {
            GameSetup = gameSetup;
            Players = new List<Player>();
            Spectators = new List<Spectator>();
            DiscardedPile = new List<Card>();
        }

        public bool PlayCard(Player player, Card cardPlayed, CardColor pickedCardColor, string targetedPlayerName)
        {
            var card = player.Cards.Find(y => y.Color == cardPlayed.Color && y.Value == cardPlayed.Value);

            if (PlayerToPlay != player && card.Value != CardValue.StealTurn)
                return false;

            if (card.Color != CardColor.Wild && card.Color != LastCardPlayed.Color && card.Value != LastCardPlayed.Value)
                return false;


            player.Cards.Remove(card);
            DiscardedPile.Add(card);

            LastCardPlayed = new LastCardPlayed(pickedCardColor, card.Value, card.ImageUrl, player.User.Name);

            GameEnded = DetectIfGameEnded();
            if (GameEnded)
            {
                return true;
            }

            if (card.Color == CardColor.Wild)
            {
                if (card.Value == CardValue.DrawFour)
                {
                    var nextPlayer = GetNextPlayerToPlay();
                    var deflectCard = nextPlayer.Cards.FirstOrDefault(x => x.Value == CardValue.Deflect);
                    if (deflectCard == null)
                    {
                        DrawCard(nextPlayer, 4, false);
                    }
                    else
                    {
                        LastCardPlayed = new LastCardPlayed(pickedCardColor, deflectCard.Value, deflectCard.ImageUrl, nextPlayer.User.Name);
                        nextPlayer.Cards.Remove(deflectCard);
                        DiscardedPile.Add(deflectCard);
                        DrawCard(player, 4, false);
                    }
                }
                else if (card.Value == CardValue.DiscardWildCards)
                {
                    Players.ForEach(x =>
                    {
                        var wildCards = x.Cards.Where(y => y.Color == CardColor.Wild).ToList();
                        DiscardedPile.AddRange(wildCards);
                        wildCards.ForEach(y => x.Cards.Remove(y));
                    });
                }
                else if (card.Value == CardValue.SwapHands)
                {
                    var targetedPlayer = Players.Find(x => x.User.Name == targetedPlayerName);

                    var playersCards = PlayerToPlay.Cards.ToList();
                    var targetedPlayerCards = targetedPlayer.Cards.ToList();

                    PlayerToPlay.Cards = targetedPlayerCards;
                    targetedPlayer.Cards = playersCards;
                }
                else if (card.Value == CardValue.BlackHole)
                {
                    Players.ForEach(x =>
                    {
                        var cardCount = x.Cards.Count;
                        DiscardedPile.AddRange(x.Cards.ToList());
                        x.Cards.Clear();
                        DrawCard(x, cardCount, false);
                    });
                }
                else if (card.Value == CardValue.DoubleEdge)
                {
                    var targetedPlayer = Players.Find(x => x.User.Name == targetedPlayerName);

                    var deflectCard = targetedPlayer.Cards.FirstOrDefault(x => x.Value == CardValue.Deflect);
                    if (deflectCard == null)
                    {

                        DrawCard(targetedPlayer, 5, false);
                        DrawCard(PlayerToPlay, 2, false);
                    }
                    else
                    {
                        LastCardPlayed = new LastCardPlayed(pickedCardColor, deflectCard.Value, deflectCard.ImageUrl, targetedPlayer.User.Name);
                        targetedPlayer.Cards.Remove(deflectCard);
                        DiscardedPile.Add(deflectCard);
                        DrawCard(PlayerToPlay, 5, false);
                        DrawCard(targetedPlayer, 2, false);
                    }

                }
                else if (card.Value == CardValue.DiscardColor)
                {
                    Players.ForEach(x =>
                  {
                      var cardsInThatColor = x.Cards.Where(y => y.Color == pickedCardColor).ToList();
                      DiscardedPile.AddRange(cardsInThatColor);
                      cardsInThatColor.ForEach(y => x.Cards.Remove(y));

                  });
                    // now randomize color
                    Random random = new Random();
                    var numbers = new int[] { 1, 2, 3, 4 };
                    int randomColor = numbers[(random.Next(4))];
                    LastCardPlayed.Color = (CardColor)randomColor;
                }
                else if (card.Value == CardValue.HandOfGod)
                {
                    if (player.Cards.Count > 7)
                    {
                        var cards = player.Cards.Take(4).ToList();
                        DiscardedPile.AddRange(cards);
                        cards.ForEach(y => player.Cards.Remove(y));
                    }
                }
                else if (card.Value == CardValue.Judgement)
                {
                    var targetedPlayer = Players.Find(x => x.User.Name == targetedPlayerName);
                    if (targetedPlayer.Cards.Any(x => x.Color == CardColor.Wild))
                    {
                        var deflectCard = targetedPlayer.Cards.FirstOrDefault(x => x.Value == CardValue.Deflect);
                        if (deflectCard == null)
                        {
                            DrawCard(targetedPlayer, 3, false);
                        }
                        else
                        {
                            LastCardPlayed = new LastCardPlayed(pickedCardColor, deflectCard.Value, deflectCard.ImageUrl, targetedPlayer.User.Name);
                            targetedPlayer.Cards.Remove(deflectCard);
                            DiscardedPile.Add(deflectCard);
                            DrawCard(PlayerToPlay, 3, false);
                        }
                    }
                }
                else if (card.Value == CardValue.UnitedWeFall)
                {
                    Players.ForEach(x => DrawCard(x, 2, false));
                }
                else if (card.Value == CardValue.ParadigmShift)
                {
                    List<Card> firstCardsBackup = null;
                    for (int i = 0; i < Players.Count; i++)
                    {
                        if (i == 0)
                            firstCardsBackup = Players[i].Cards.ToList();
                        if (i != Players.Count - 1)
                        {
                            Players[i].Cards = Players[i + 1].Cards;
                        }
                        else
                        {
                            Players[i].Cards = firstCardsBackup;
                        }
                    }
                }
            }
            else
            {
                if (card.Value == CardValue.DrawTwo)
                {
                    var nextPlayer = GetNextPlayerToPlay();
                    var deflectCard = nextPlayer.Cards.FirstOrDefault(x => x.Value == CardValue.Deflect);
                    if (deflectCard == null)
                    {
                        DrawCard(nextPlayer, 2, false);
                    }
                    else
                    {
                        LastCardPlayed = new LastCardPlayed(pickedCardColor, deflectCard.Value, deflectCard.ImageUrl, nextPlayer.User.Name);
                        nextPlayer.Cards.Remove(deflectCard);
                        DiscardedPile.Add(deflectCard);
                        DrawCard(player, 2, false);
                    }
                }
                else if (card.Value == CardValue.Reverse)
                {
                    Direction = Direction == Direction.Right ? Direction.Left : Direction.Right;
                }
                else if (card.Value == CardValue.Skip)
                {
                    PlayerToPlay = GetNextPlayerToPlay();
                }
                else if (card.Value == CardValue.StealTurn)
                {
                    PlayerToPlay = player;
                }
            }

            PlayerToPlay = GetNextPlayerToPlay();
            return true;
        }



        public void StartGame()
        {
            Card lastCardDrew;
            Deck = new Deck(GameSetup.GameMode);
            do
            {
                lastCardDrew = Deck.Draw(1).First();
                DiscardedPile.Add(lastCardDrew);
            } while (lastCardDrew.Color == CardColor.Wild);
            LastCardPlayed = new LastCardPlayed(lastCardDrew.Color, lastCardDrew.Value, lastCardDrew.ImageUrl, string.Empty);
            Direction = Direction.Right;
            PlayerToPlay = Players.First();
            Players.ForEach(x => x.Cards = Deck.Draw(7));
            GameStarted = true;
        }


        public void DrawCard(Player player, int count, bool normalDraw)
        {
            var deckCount = Deck.Cards.Count;
            if (deckCount < count)
            {
                player.Cards.AddRange(Deck.Draw(deckCount));
                Deck.Cards = DiscardedPile.ToList();
                Deck.Shuffle();
                DiscardedPile.Clear();
                player.Cards.AddRange(Deck.Draw(count - deckCount));
            }
            else
            {
                player.Cards.AddRange(Deck.Draw(count));
            }

            if (normalDraw)
            {
                // if it's normalDraw then it's not a result of a wildcard
                PlayerToPlay = GetNextPlayerToPlay();
            }
        }


        // -------------------------------------private------------


        private Player GetNextPlayerToPlay()
        {
            var indexOfCurrentPlayer = Players.IndexOf(PlayerToPlay);
            if (Direction == Direction.Right)
            {
                if (indexOfCurrentPlayer == Players.Count - 1)
                {
                    return Players.First();
                }
                else
                {
                    return Players[indexOfCurrentPlayer + 1];
                }
            }
            if (Direction == Direction.Left)
            {
                if (indexOfCurrentPlayer == 0)
                {
                    return Players.Last();
                }
                else
                {
                    return Players[indexOfCurrentPlayer - 1];
                }
            }
            throw new Exception("Error, can't access that direction");

        }

        private bool DetectIfGameEnded()
        {
            return !PlayerToPlay.Cards.Any();
        }
    }
}