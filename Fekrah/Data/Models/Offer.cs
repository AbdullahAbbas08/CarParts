using Data.ModelInterfaces;
using Data.Enums;

namespace Data.Models
{
    public class Offer : IAuditableInsert, IAuditableUpdate
    {
        [Key]
        public int Id { get; set; }
        // نوع العرض (سعر جديد، خصم نسبة، خصم مبلغ، باقة، اشتري X خذ Y, كود ترويجي)
        public OfferTypeEnum Type { get; set; }

        // قيم عامة (يتم استخدام الحقول المناسبة حسب النوع)
        public double? NewPrice { get; set; }            // يستخدم مع Type = NewPrice أو Bundle
        public double? DiscountRate { get; set; }        // نسبة مئوية Type = Percentage أو PromoCode
        public double? FixedAmount { get; set; }         // خصم مبلغ ثابت Type = FixedAmount أو PromoCode

        // Buy X Get Y (مثلاً اشتري 2 خذ 1 مجاني)
        public int? BuyQuantity { get; set; }
        public int? GetQuantity { get; set; }
        public int? FreePartId { get; set; }             // لو القطعة المجانية مختلفة
        [ForeignKey(nameof(FreePartId))]
        public virtual Part? FreePart { get; set; }

        // Bundle (مجموعة قطع بسعر إجمالي NewPrice)
        public string? BundlePartIdsCsv { get; set; }    // خزن قائمة Ids مفصولة بفواصل كبداية بسيطة

        // PromoCode خصائص خاصة بالكود الترويجي
        public string? PromoCode { get; set; }                // الكود نفسه (يجب أن يكون فريد عند النوع PromoCode)
        public int? UsageLimit { get; set; }             // الحد الإجمالي للاستخدام
        public int? PerUserLimit { get; set; }           // الحد لكل مستخدم
        public int? TimesUsed { get; set; }              // عدد مرات الاستخدام الفعلية
        public double? MinOrderSubtotal { get; set; }    // أقل قيمة سلة لتفعيل الكود

        // صلاحية زمنية
        public DateTimeOffset? StartAt { get; set; }
        public DateTimeOffset? EndAt { get; set; }
        public bool IsActive { get; set; } = true;

        public int PartId { get; set; }
        [ForeignKey(nameof(PartId))]
        public virtual Part Part { get; set; }

        public int? CreatedByUserId { get; set; }
        public DateTimeOffset? CreatedOn { get; set; }
        [ForeignKey(nameof(CreatedByUserId))]
        public User? CreatedByUser { get; set; }

        public int? UpdatedBy { get; set; }
        public DateTimeOffset? UpdatedOn { get; set; }
        [ForeignKey(nameof(UpdatedBy))]
        public User? UpdatedByUser { get; set; }
    }
}
