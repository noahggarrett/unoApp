using System;
using System.Collections.Generic;
using System.Linq;
using Common.Enums;
using EntityObjects.Cards.Abstraction;

namespace EntityObjects.Cards.Wild
{
    public class DoubleEdge : ICard
    {
        public DoubleEdge()
        {
            Id = Guid.NewGuid().ToString();
        }
        public string Id { get; }
        public CardColor Color => CardColor.Wild;
        public CardValue Value => CardValue.DoubleEdge;
        public string ImageUrl => $"/images/cards/small/{(int)Color}/{(int)Value}.png";
        public bool RequirePickColor => true;
        public bool RequireTargetPlayer => true;
    }
}