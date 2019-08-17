using System;
using System.Collections.Generic;
using System.Linq;
using Uno.Enums;
using Uno.Models.Entities.Cards.Abstraction;
using Uno.Models.Helpers;

namespace Uno.Models.Entities.Cards.Wild
{
    public class DiscardNumber : ICard
    {
        public DiscardNumber()
        {
            Id = Guid.NewGuid().ToString();
            Color = CardColor.Wild;
            Value = CardValue.DiscardNumber;
            ImageUrl = $"/images/cards/small/{(int)Color}/{(int)Value}.png";
        }
        public string Id { get; set; }
        public CardColor Color { get; set; }
        public CardValue Value { get; set; }
        public string ImageUrl { get; set; }

        public MoveResult ProcessCardEffect(Game game, MoveParams moveParams)
        {
            var messagesToLog = new List<string>();
            var messageToLog = $"{moveParams.PlayerPlayed.User.Name}  played discard number. Numbers that are discarded: {string.Join(' ', moveParams.NumbersToDiscard)}. ";
            game.Players.ForEach(p =>
            {
                var cardsToDiscard = p.Cards.Where(c => moveParams.NumbersToDiscard.Contains((int)c.Value)).ToList();
                cardsToDiscard.ForEach(x => p.Cards.Remove(x));
            });
            game.DrawCard(moveParams.PlayerPlayed,1,false);
            messagesToLog.Add(messageToLog);
           return new MoveResult(messagesToLog);
        }
    }
}