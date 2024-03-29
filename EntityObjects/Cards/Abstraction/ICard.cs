using Common.Enums;

namespace EntityObjects.Cards.Abstraction
{
    public interface ICard
    {
        string Id { get; }
        CardColor Color { get; }
        CardValue Value { get; }
        string ImageUrl { get; }
        bool RequirePickColor { get; }
        bool RequireTargetPlayer { get; }
    }
}