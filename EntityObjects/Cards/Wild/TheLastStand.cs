using System;
using System.Collections.Generic;
using Common.Enums;
using EntityObjects.Cards.Abstraction;

namespace EntityObjects.Cards.Wild
{
    public class TheLastStand : ICard
    {
        public TheLastStand()
        {
            Id = Guid.NewGuid().ToString();
        }
        public string Id { get; }
        public CardColor Color => CardColor.Wild;
        public CardValue Value => CardValue.TheLastStand;
        public string ImageUrl => $"/images/cards/small/{(int)Color}/{(int)Value}.png";
        public bool RequirePickColor => true;
        public bool RequireTargetPlayer => false;
    }
}