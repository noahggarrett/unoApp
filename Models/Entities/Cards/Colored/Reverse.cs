using System;
using System.Collections.Generic;
using Uno.Enums;
using Uno.Models;
using unoApp.Models.Abstraction;
using unoApp.Models.Helpers;

namespace unoApp.Models.Entities.Cards.Colored
{
    public class Reverse : ICard
    {
        public Reverse(CardColor cardColor)
        {
            Id = Guid.NewGuid().ToString();
            Color = cardColor;
            Value = CardValue.Reverse;
            ImageUrl = $"/images/cards/small/{(int)cardColor}/{(int)Value}.png";
        }
        public string Id { get; set; }
        public CardColor Color { get; set; }
        public CardValue Value { get; set; }
        public string ImageUrl { get; set; }

        public MoveResult ProcessCardEffect(Game game, MoveParams moveParams)
        {
            var messagesToLog = new List<string>();
            messagesToLog.Add($"{moveParams.PlayerPlayed.User.Name} changed direction");
            game.Direction = game.Direction == Direction.Right ? Direction.Left : Direction.Right;
           return new MoveResult(messagesToLog);
        }
    }
}