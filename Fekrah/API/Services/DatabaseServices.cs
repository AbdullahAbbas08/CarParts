using Data;
using Data.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public static partial class ServicesRegistration
    {
        public static void AddDatabaseContext(this IServiceCollection services, string connectionString)
        {

            services.AddEntityFrameworkSqlServer().AddDbContext<DatabaseContext>(options =>
            {
                options.UseLazyLoadingProxies(false)
                .UseSqlServer(connectionString, serverDbContextOptionsBuilder =>
                {
                    int minutes = (int)TimeSpan.FromMinutes(3).TotalSeconds;
                    serverDbContextOptionsBuilder.CommandTimeout(minutes);
                    serverDbContextOptionsBuilder.EnableRetryOnFailure();
                });
            });
        }

        public static void DatabaseMigration(this IServiceCollection services)
        {
            //IServiceProvider serviceProvider = services.BuildServiceProvider();
        }

        public static async Task SeedGovernorates(DatabaseContext dbContext)
        {
            if (dbContext == null) return;
            if (await dbContext.Set<Governorate>().AnyAsync()) return;

            var governorates = new List<Governorate>
            {
                new Governorate { Name = "القاهرة" },
                new Governorate { Name = "الجيزة" },
                new Governorate { Name = "الأسكندرية" },
                new Governorate { Name = "الدقهلية" },
                new Governorate { Name = "البحر الأحمر" },
                new Governorate { Name = "البحيرة" },
                new Governorate { Name = "الفيوم" },
                new Governorate { Name = "الغربية" },
                new Governorate { Name = "الإسماعيلية" },
                new Governorate { Name = "المنوفية" },
                new Governorate { Name = "المنيا" },
                new Governorate { Name = "القليوبية" },
                new Governorate { Name = "الوادي الجديد" },
                new Governorate { Name = "السويس" },
                new Governorate { Name = "اسوان" },
                new Governorate { Name = "اسيوط" },
                new Governorate { Name = "بني سويف" },
                new Governorate { Name = "بورسعيد" },
                new Governorate { Name = "دمياط" },
                new Governorate { Name = "الشرقية" },
                new Governorate { Name = "جنوب سيناء" },
                new Governorate { Name = "كفر الشيخ" },
                new Governorate { Name = "مطروح" },
                new Governorate { Name = "الأقصر" },
                new Governorate { Name = "قنا" },
                new Governorate { Name = "شمال سيناء" },
                new Governorate { Name = "سوهاج" }
            };
            dbContext.Set<Governorate>().AddRange(governorates);
            await dbContext.SaveChangesAsync();
        }

        public static async Task SeedCities(DatabaseContext dbContext)
        {
            if (dbContext == null) return;
            if (await dbContext.Set<Data.Models.City>().AnyAsync()) return;

            var cities = new List<Data.Models.City>
            {
                // القاهرة
                new Data.Models.City { NameAr = "القاهرة", GovernorateId = 1 },
                new Data.Models.City { NameAr = "حلوان", GovernorateId = 1 },
                new Data.Models.City { NameAr = "مدينة نصر", GovernorateId = 1 },
                new Data.Models.City { NameAr = "مصر الجديدة", GovernorateId = 1 },
                new Data.Models.City { NameAr = "المعادي", GovernorateId = 1 },
                new Data.Models.City { NameAr = "شبرا", GovernorateId = 1 },
                new Data.Models.City { NameAr = "عين شمس", GovernorateId = 1 },
                new Data.Models.City { NameAr = "الزيتون", GovernorateId = 1 },
                new Data.Models.City { NameAr = "المرج", GovernorateId = 1 },
                new Data.Models.City { NameAr = "المطرية", GovernorateId = 1 },
                new Data.Models.City { NameAr = "الساحل", GovernorateId = 1 },
                new Data.Models.City { NameAr = "الشرابية", GovernorateId = 1 },
                new Data.Models.City { NameAr = "الزمالك", GovernorateId = 1 },
                new Data.Models.City { NameAr = "وسط البلد", GovernorateId = 1 },
                new Data.Models.City { NameAr = "مدينة بدر", GovernorateId = 1 },
                new Data.Models.City { NameAr = "مدينة الشروق", GovernorateId = 1 },
                new Data.Models.City { NameAr = "مدينة 15 مايو", GovernorateId = 1 },
                new Data.Models.City { NameAr = "التجمع الخامس", GovernorateId = 1 },
                // الجيزة
                new Data.Models.City { NameAr = "الجيزة", GovernorateId = 2 },
                new Data.Models.City { NameAr = "6 أكتوبر", GovernorateId = 2 },
                new Data.Models.City { NameAr = "الشيخ زايد", GovernorateId = 2 },
                new Data.Models.City { NameAr = "العجوزة", GovernorateId = 2 },
                new Data.Models.City { NameAr = "الدقي", GovernorateId = 2 },
                new Data.Models.City { NameAr = "الهرم", GovernorateId = 2 },
                new Data.Models.City { NameAr = "إمبابة", GovernorateId = 2 },
                new Data.Models.City { NameAr = "البدرشين", GovernorateId = 2 },
                new Data.Models.City { NameAr = "العياط", GovernorateId = 2 },
                new Data.Models.City { NameAr = "أوسيم", GovernorateId = 2 },
                new Data.Models.City { NameAr = "كرداسة", GovernorateId = 2 },
                new Data.Models.City { NameAr = "الحوامدية", GovernorateId = 2 },
                new Data.Models.City { NameAr = "أبو النمرس", GovernorateId = 2 },
                new Data.Models.City { NameAr = "منشأة القناطر", GovernorateId = 2 },
                // الإسكندرية
                new Data.Models.City { NameAr = "الإسكندرية", GovernorateId = 3 },
                new Data.Models.City { NameAr = "برج العرب", GovernorateId = 3 },
                new Data.Models.City { NameAr = "العجمي", GovernorateId = 3 },
                new Data.Models.City { NameAr = "سيدي جابر", GovernorateId = 3 },
                new Data.Models.City { NameAr = "سيدي بشر", GovernorateId = 3 },
                new Data.Models.City { NameAr = "محرم بك", GovernorateId = 3 },
                new Data.Models.City { NameAr = "المنتزه", GovernorateId = 3 },
                new Data.Models.City { NameAr = "الجمرك", GovernorateId = 3 },
                new Data.Models.City { NameAr = "المعمورة", GovernorateId = 3 },
                // الدقهلية
                new Data.Models.City { NameAr = "المنصورة", GovernorateId = 4 },
                new Data.Models.City { NameAr = "طلخا", GovernorateId = 4 },
                new Data.Models.City { NameAr = "ميت غمر", GovernorateId = 4 },
                new Data.Models.City { NameAr = "دكرنس", GovernorateId = 4 },
                new Data.Models.City { NameAr = "أجا", GovernorateId = 4 },
                new Data.Models.City { NameAr = "منية النصر", GovernorateId = 4 },
                new Data.Models.City { NameAr = "السنبلاوين", GovernorateId = 4 },
                new Data.Models.City { NameAr = "بني عبيد", GovernorateId = 4 },
                new Data.Models.City { NameAr = "الجمالية", GovernorateId = 4 },
                new Data.Models.City { NameAr = "شربين", GovernorateId = 4 },
                new Data.Models.City { NameAr = "المطرية", GovernorateId = 4 },
                new Data.Models.City { NameAr = "بلقاس", GovernorateId = 4 },
                new Data.Models.City { NameAr = "تمي الأمديد", GovernorateId = 4 },
                new Data.Models.City { NameAr = "نبروه", GovernorateId = 4 },
                // البحر الأحمر
                new Data.Models.City { NameAr = "الغردقة", GovernorateId = 5 },
                new Data.Models.City { NameAr = "رأس غارب", GovernorateId = 5 },
                new Data.Models.City { NameAr = "سفاجا", GovernorateId = 5 },
                new Data.Models.City { NameAr = "القصير", GovernorateId = 5 },
                new Data.Models.City { NameAr = "مرسى علم", GovernorateId = 5 },
                new Data.Models.City { NameAr = "الشلاتين", GovernorateId = 5 },
                new Data.Models.City { NameAr = "حلايب", GovernorateId = 5 },
                // البحيرة
                new Data.Models.City { NameAr = "دمنهور", GovernorateId = 6 },
                new Data.Models.City { NameAr = "كفر الدوار", GovernorateId = 6 },
                new Data.Models.City { NameAr = "رشيد", GovernorateId = 6 },
                new Data.Models.City { NameAr = "إيتاي البارود", GovernorateId = 6 },
                new Data.Models.City { NameAr = "أبو حمص", GovernorateId = 6 },
                new Data.Models.City { NameAr = "الدلنجات", GovernorateId = 6 },
                new Data.Models.City { NameAr = "المحمودية", GovernorateId = 6 },
                new Data.Models.City { NameAr = "شبراخيت", GovernorateId = 6 },
                new Data.Models.City { NameAr = "كوم حمادة", GovernorateId = 6 },
                new Data.Models.City { NameAr = "بدر", GovernorateId = 6 },
                new Data.Models.City { NameAr = "وادي النطرون", GovernorateId = 6 },
                new Data.Models.City { NameAr = "النوبارية الجديدة", GovernorateId = 6 },
                // الفيوم
                new Data.Models.City { NameAr = "الفيوم", GovernorateId = 7 },
                new Data.Models.City { NameAr = "سنورس", GovernorateId = 7 },
                new Data.Models.City { NameAr = "إطسا", GovernorateId = 7 },
                new Data.Models.City { NameAr = "طامية", GovernorateId = 7 },
                new Data.Models.City { NameAr = "يوسف الصديق", GovernorateId = 7 },
                new Data.Models.City { NameAr = "أبشواي", GovernorateId = 7 },
                // الغربية
                new Data.Models.City { NameAr = "طنطا", GovernorateId = 8 },
                new Data.Models.City { NameAr = "المحلة الكبرى", GovernorateId = 8 },
                new Data.Models.City { NameAr = "كفر الزيات", GovernorateId = 8 },
                new Data.Models.City { NameAr = "زفتى", GovernorateId = 8 },
                new Data.Models.City { NameAr = "السنطة", GovernorateId = 8 },
                new Data.Models.City { NameAr = "بسيون", GovernorateId = 8 },
                new Data.Models.City { NameAr = "سمنود", GovernorateId = 8 },
                new Data.Models.City { NameAr = "قطور", GovernorateId = 8 },
                // الإسماعيلية
                new Data.Models.City { NameAr = "الإسماعيلية", GovernorateId = 9 },
                new Data.Models.City { NameAr = "فايد", GovernorateId = 9 },
                new Data.Models.City { NameAr = "القنطرة شرق", GovernorateId = 9 },
                new Data.Models.City { NameAr = "القنطرة غرب", GovernorateId = 9 },
                new Data.Models.City { NameAr = "التل الكبير", GovernorateId = 9 },
                new Data.Models.City { NameAr = "أبو صوير", GovernorateId = 9 },
                new Data.Models.City { NameAr = "القصاصين الجديدة", GovernorateId = 9 },
                // المنوفية
                new Data.Models.City { NameAr = "شبين الكوم", GovernorateId = 10 },
                new Data.Models.City { NameAr = "منوف", GovernorateId = 10 },
                new Data.Models.City { NameAr = "سرس الليان", GovernorateId = 10 },
                new Data.Models.City { NameAr = "أشمون", GovernorateId = 10 },
                new Data.Models.City { NameAr = "الباجور", GovernorateId = 10 },
                new Data.Models.City { NameAr = "بركة السبع", GovernorateId = 10 },
                new Data.Models.City { NameAr = "تلا", GovernorateId = 10 },
                new Data.Models.City { NameAr = "الشهداء", GovernorateId = 10 },
                // المنيا
                new Data.Models.City { NameAr = "المنيا", GovernorateId = 11 },
                new Data.Models.City { NameAr = "ملوي", GovernorateId = 11 },
                new Data.Models.City { NameAr = "مطاي", GovernorateId = 11 },
                new Data.Models.City { NameAr = "بني مزار", GovernorateId = 11 },
                new Data.Models.City { NameAr = "سمالوط", GovernorateId = 11 },
                new Data.Models.City { NameAr = "دير مواس", GovernorateId = 11 },
                new Data.Models.City { NameAr = "مغاغة", GovernorateId = 11 },
                new Data.Models.City { NameAr = "العدوة", GovernorateId = 11 },
                new Data.Models.City { NameAr = "أبو قرقاص", GovernorateId = 11 },
                // القليوبية
                new Data.Models.City { NameAr = "بنها", GovernorateId = 12 },
                new Data.Models.City { NameAr = "شبرا الخيمة", GovernorateId = 12 },
                new Data.Models.City { NameAr = "قليوب", GovernorateId = 12 },
                new Data.Models.City { NameAr = "القناطر الخيرية", GovernorateId = 12 },
                new Data.Models.City { NameAr = "الخانكة", GovernorateId = 12 },
                new Data.Models.City { NameAr = "كفر شكر", GovernorateId = 12 },
                new Data.Models.City { NameAr = "طوخ", GovernorateId = 12 },
                new Data.Models.City { NameAr = "شبين القناطر", GovernorateId = 12 },
                // الوادي الجديد
                new Data.Models.City { NameAr = "الخارجة", GovernorateId = 13 },
                new Data.Models.City { NameAr = "الداخلة", GovernorateId = 13 },
                new Data.Models.City { NameAr = "الفرافرة", GovernorateId = 13 },
                new Data.Models.City { NameAr = "باريس", GovernorateId = 13 },
                new Data.Models.City { NameAr = "بلاط", GovernorateId = 13 },
                // السويس
                new Data.Models.City { NameAr = "السويس", GovernorateId = 14 },
                new Data.Models.City { NameAr = "عتاقة", GovernorateId = 14 },
                new Data.Models.City { NameAr = "الجناين", GovernorateId = 14 },
                new Data.Models.City { NameAr = "الأربعين", GovernorateId = 14 },
                // اسوان
                new Data.Models.City { NameAr = "أسوان", GovernorateId = 15 },
                new Data.Models.City { NameAr = "دراو", GovernorateId = 15 },
                new Data.Models.City { NameAr = "كوم أمبو", GovernorateId = 15 },
                new Data.Models.City { NameAr = "نصر النوبة", GovernorateId = 15 },
                new Data.Models.City { NameAr = "إدفو", GovernorateId = 15 },
                new Data.Models.City { NameAr = "كلابشة", GovernorateId = 15 },
                // اسيوط
                new Data.Models.City { NameAr = "أسيوط", GovernorateId = 16 },
                new Data.Models.City { NameAr = "ديروط", GovernorateId = 16 },
                new Data.Models.City { NameAr = "منفلوط", GovernorateId = 16 },
                new Data.Models.City { NameAr = "القوصية", GovernorateId = 16 },
                new Data.Models.City { NameAr = "أبنوب", GovernorateId = 16 },
                new Data.Models.City { NameAr = "أبو تيج", GovernorateId = 16 },
                new Data.Models.City { NameAr = "الغنايم", GovernorateId = 16 },
                new Data.Models.City { NameAr = "ساحل سليم", GovernorateId = 16 },
                new Data.Models.City { NameAr = "البداري", GovernorateId = 16 },
                // بني سويف
                new Data.Models.City { NameAr = "بني سويف", GovernorateId = 17 },
                new Data.Models.City { NameAr = "الواسطى", GovernorateId = 17 },
                new Data.Models.City { NameAr = "ناصر", GovernorateId = 17 },
                new Data.Models.City { NameAr = "إهناسيا", GovernorateId = 17 },
                new Data.Models.City { NameAr = "ببا", GovernorateId = 17 },
                new Data.Models.City { NameAr = "سمسطا", GovernorateId = 17 },
                new Data.Models.City { NameAr = "الفشن", GovernorateId = 17 },
                // بورسعيد
                new Data.Models.City { NameAr = "بورسعيد", GovernorateId = 18 },
                new Data.Models.City { NameAr = "بورفؤاد", GovernorateId = 18 },
                // دمياط
                new Data.Models.City { NameAr = "دمياط", GovernorateId = 19 },
                new Data.Models.City { NameAr = "رأس البر", GovernorateId = 19 },
                new Data.Models.City { NameAr = "فارسكور", GovernorateId = 19 },
                new Data.Models.City { NameAr = "الزرقا", GovernorateId = 19 },
                new Data.Models.City { NameAr = "السرو", GovernorateId = 19 },
                new Data.Models.City { NameAr = "كفر سعد", GovernorateId = 19 },
                new Data.Models.City { NameAr = "كفر البطيخ", GovernorateId = 19 },
                new Data.Models.City { NameAr = "ميت أبو غالب", GovernorateId = 19 },
                // الشرقية (مكتملة أعلاه)
                // جنوب سيناء
                new Data.Models.City { NameAr = "طور سيناء", GovernorateId = 21 },
                new Data.Models.City { NameAr = "شرم الشيخ", GovernorateId = 21 },
                new Data.Models.City { NameAr = "دهب", GovernorateId = 21 },
                new Data.Models.City { NameAr = "نويبع", GovernorateId = 21 },
                new Data.Models.City { NameAr = "طابا", GovernorateId = 21 },
                new Data.Models.City { NameAr = "سانت كاترين", GovernorateId = 21 },
                new Data.Models.City { NameAr = "أبو رديس", GovernorateId = 21 },
                new Data.Models.City { NameAr = "أبو زنيمة", GovernorateId = 21 },
                new Data.Models.City { NameAr = "رأس سدر", GovernorateId = 21 },
                // كفر الشيخ
                new Data.Models.City { NameAr = "كفر الشيخ", GovernorateId = 22 },
                new Data.Models.City { NameAr = "دسوق", GovernorateId = 22 },
                new Data.Models.City { NameAr = "فوه", GovernorateId = 22 },
                new Data.Models.City { NameAr = "مطوبس", GovernorateId = 22 },
                new Data.Models.City { NameAr = "سيدي سالم", GovernorateId = 22 },
                new Data.Models.City { NameAr = "قلين", GovernorateId = 22 },
                new Data.Models.City { NameAr = "الحامول", GovernorateId = 22 },
                new Data.Models.City { NameAr = "بلطيم", GovernorateId = 22 },
                new Data.Models.City { NameAr = "الرياض", GovernorateId = 22 },
                // مطروح
                new Data.Models.City { NameAr = "مرسى مطروح", GovernorateId = 23 },
                new Data.Models.City { NameAr = "الحمام", GovernorateId = 23 },
                new Data.Models.City { NameAr = "العلمين", GovernorateId = 23 },
                new Data.Models.City { NameAr = "سيدي براني", GovernorateId = 23 },
                new Data.Models.City { NameAr = "النجيلة", GovernorateId = 23 },
                new Data.Models.City { NameAr = "سيوة", GovernorateId = 23 },
                new Data.Models.City { NameAr = "السلوم", GovernorateId = 23 },
                new Data.Models.City { NameAr = "الضبعة", GovernorateId = 23 },
                // الأقصر
                new Data.Models.City { NameAr = "الأقصر", GovernorateId = 24 },
                new Data.Models.City { NameAr = "إسنا", GovernorateId = 24 },
                new Data.Models.City { NameAr = "أرمنت", GovernorateId = 24 },
                new Data.Models.City { NameAr = "الزينية", GovernorateId = 24 },
                new Data.Models.City { NameAr = "الطود", GovernorateId = 24 },
                new Data.Models.City { NameAr = "البياضية", GovernorateId = 24 },
                new Data.Models.City { NameAr = "القرنة", GovernorateId = 24 },
                // قنا
                new Data.Models.City { NameAr = "قنا", GovernorateId = 25 },
                new Data.Models.City { NameAr = "نجع حمادي", GovernorateId = 25 },
                new Data.Models.City { NameAr = "دشنا", GovernorateId = 25 },
                new Data.Models.City { NameAr = "قفط", GovernorateId = 25 },
                new Data.Models.City { NameAr = "قوص", GovernorateId = 25 },
                new Data.Models.City { NameAr = "أبوتشت", GovernorateId = 25 },
                new Data.Models.City { NameAr = "فرشوط", GovernorateId = 25 },
                new Data.Models.City { NameAr = "نقادة", GovernorateId = 25 },
                // شمال سيناء
                new Data.Models.City { NameAr = "العريش", GovernorateId = 26 },
                new Data.Models.City { NameAr = "رفح", GovernorateId = 26 },
                new Data.Models.City { NameAr = "الشيخ زويد", GovernorateId = 26 },
                new Data.Models.City { NameAr = "بئر العبد", GovernorateId = 26 },
                new Data.Models.City { NameAr = "الحسنة", GovernorateId = 26 },
                new Data.Models.City { NameAr = "نخل", GovernorateId = 26 },
                // سوهاج
                new Data.Models.City { NameAr = "سوهاج", GovernorateId = 27 },
                new Data.Models.City { NameAr = "طهطا", GovernorateId = 27 },
                new Data.Models.City { NameAr = "طما", GovernorateId = 27 },
                new Data.Models.City { NameAr = "المراغة", GovernorateId = 27 },
                new Data.Models.City { NameAr = "جهينة", GovernorateId = 27 },
                new Data.Models.City { NameAr = "ساقلتة", GovernorateId = 27 },
                new Data.Models.City { NameAr = "أخميم", GovernorateId = 27 },
                new Data.Models.City { NameAr = "البلينا", GovernorateId = 27 },
                new Data.Models.City { NameAr = "دار السلام", GovernorateId = 27 },
                new Data.Models.City { NameAr = "منشأة القناطر", GovernorateId = 27 },
            };
            dbContext.Set<Data.Models.City>().AddRange(cities);
            await dbContext.SaveChangesAsync();
        }

        public static async Task SeedCategories(DatabaseContext dbContext)
        {
            if (dbContext == null) return;
            if (await dbContext.Set<Category>().AnyAsync()) return;

            var categories = new List<Category>
            {
                new Category { Name = "موتور وعفشة" },
                new Category { Name = "فرامل" },
                new Category { Name = "كهربا" },
                new Category { Name = "كاوتش وجنط" },
                new Category { Name = "تكييف" },
                new Category { Name = "زيوت وسوائل" },
                new Category { Name = "مساعدين ودركسيون" },
                new Category { Name = "صاج وكماليات" },
                new Category { Name = "زجاج ومرايات" },
                new Category { Name = "إكسسوارات" },
                new Category { Name = "طرمبة" },
                new Category { Name = "شكمان" },
                new Category { Name = "ريداتير وتبريد" },
                new Category { Name = "دبرياج" },
                new Category { Name = "رشاشات" },
                new Category { Name = "أمان وسيفتي" },
                new Category { Name = "كراسي وأحزمة" },
                new Category { Name = "أبواب وشبابيك" }
            };
            dbContext.Set<Category>().AddRange(categories);
            await dbContext.SaveChangesAsync();
        }

        public static async Task SeedRoles(DatabaseContext dbContext)
        {
            if (dbContext == null) return;
            if (await dbContext.Set<Role>().AnyAsync()) return;

            var roles = new List<Role>
            {
                new Role{RoleNameAr = "مدير", RoleNameEn="manager", IsActive = true},
                new Role{RoleNameAr = "فني", RoleNameEn="technical", IsActive = true},
                new Role{RoleNameAr = "أمين مخزن", RoleNameEn="workhouse keeper", IsActive = true},
                new Role{RoleNameAr = "مندوب مبيعات", RoleNameEn="sales manager", IsActive = true},
            };

            dbContext.Set<Role>().AddRange(roles);
            await dbContext.SaveChangesAsync();
        }

        public static async Task SeedBrands(DatabaseContext dbContext)
        {
            if (dbContext == null) return;
            if (await dbContext.Set<Brand>().AnyAsync()) return;

            var brands = new List<Brand>
            {
                new Brand { Name = "تويوتا", Code = "TOYOTA", ImageUrl = "" },
                new Brand { Name = "هيونداي", Code = "HYUNDAI", ImageUrl = "" },
                new Brand { Name = "كيا", Code = "KIA", ImageUrl = "" },
                new Brand { Name = "شيفروليه", Code = "CHEVROLET", ImageUrl = "" },
                new Brand { Name = "نيسان", Code = "NISSAN", ImageUrl = "" },
                new Brand { Name = "ميتسوبيشي", Code = "MITSUBISHI", ImageUrl = "" },
                new Brand { Name = "فورد", Code = "FORD", ImageUrl = "" },
                new Brand { Name = "بي إم دبليو", Code = "BMW", ImageUrl = "" },
                new Brand { Name = "مرسيدس", Code = "MERCEDES", ImageUrl = "" },
                new Brand { Name = "رينو", Code = "RENAULT", ImageUrl = "" },
                new Brand { Name = "هوندا", Code = "HONDA", ImageUrl = "" },
                new Brand { Name = "أوبل", Code = "OPEL", ImageUrl = "" },
                new Brand { Name = "جيلي", Code = "GEELY", ImageUrl = "" },
                new Brand { Name = "سوزوكي", Code = "SUZUKI", ImageUrl = "" },
                new Brand { Name = "بيجو", Code = "PEUGEOT", ImageUrl = "" },
                new Brand { Name = "سكودا", Code = "SKODA", ImageUrl = "" },
                new Brand { Name = "فولكس فاجن", Code = "VOLKSWAGEN", ImageUrl = "" },
                new Brand { Name = "جيب", Code = "JEEP", ImageUrl = "" },
                new Brand { Name = "داسيا", Code = "DACIA", ImageUrl = "" },
                new Brand { Name = "سيات", Code = "SEAT", ImageUrl = "" },
                new Brand { Name = "شيري", Code = "CHERY", ImageUrl = "" },
                new Brand { Name = "BYD", Code = "BYD", ImageUrl = "" },
                new Brand { Name = "MG", Code = "MG", ImageUrl = "" },
                new Brand { Name = "لادا", Code = "LADA", ImageUrl = "" },
                new Brand { Name = "سانج يونج", Code = "SSANGYONG", ImageUrl = "" },
                new Brand { Name = "فاو", Code = "FAW", ImageUrl = "" },
                new Brand { Name = "بروتون", Code = "PROTON", ImageUrl = "" },
                new Brand { Name = "إم جي", Code = "EMG", ImageUrl = "" },
                new Brand { Name = "سوبارو", Code = "SUBARU", ImageUrl = "" },
                new Brand { Name = "هونداي", Code = "HYUNDAI2", ImageUrl = "" },
                new Brand { Name = "تسلا", Code = "TESLA", ImageUrl = "" },
                new Brand { Name = "أودي", Code = "AUDI", ImageUrl = "" },
                new Brand { Name = "بورش", Code = "PORSCHE", ImageUrl = "" },
                new Brand { Name = "مازدا", Code = "MAZDA", ImageUrl = "" },
                new Brand { Name = "كرايسلر", Code = "CHRYSLER", ImageUrl = "" },
                new Brand { Name = "إيسوزو", Code = "ISUZU", ImageUrl = "" },
                new Brand { Name = "سيتروين", Code = "CITROEN", ImageUrl = "" },
                new Brand { Name = "دايو", Code = "DAEWOO", ImageUrl = "" },
                new Brand { Name = "فيات", Code = "FIAT", ImageUrl = "" },
                new Brand { Name = "رام", Code = "RAM", ImageUrl = "" },
                new Brand { Name = "لينكولن", Code = "LINCOLN", ImageUrl = "" },
                new Brand { Name = "سوزوكي2", Code = "SUZUKI2", ImageUrl = "" },
                new Brand { Name = "هامر", Code = "HUMMER", ImageUrl = "" },
                new Brand { Name = "إنفينيتي", Code = "INFINITI", ImageUrl = "" },
                new Brand { Name = "أكورا", Code = "ACURA", ImageUrl = "" },
                new Brand { Name = "بيوك", Code = "BUICK", ImageUrl = "" },
                new Brand { Name = "كاديلاك", Code = "CADILLAC", ImageUrl = "" },
                new Brand { Name = "دودج", Code = "DODGE", ImageUrl = "" },
                new Brand { Name = "فولفو", Code = "VOLVO", ImageUrl = "" },
                new Brand { Name = "ميني", Code = "MINI", ImageUrl = "" },
                new Brand { Name = "روفر", Code = "ROVER", ImageUrl = "" },
                new Brand { Name = "سوزوكي3", Code = "SUZUKI3", ImageUrl = "" },
                new Brand { Name = "هونداي3", Code = "HYUNDAI3", ImageUrl = "" },
                new Brand { Name = "بي إم دبليو2", Code = "BMW2", ImageUrl = "" },
                new Brand { Name = "مرسيدس2", Code = "MERCEDES2", ImageUrl = "" },
                new Brand { Name = "تويوتا2", Code = "TOYOTA2", ImageUrl = "" }
            };
            dbContext.Set<Brand>().AddRange(brands);
            await dbContext.SaveChangesAsync();
        }

        public static async Task SeedModelTypes(DatabaseContext dbContext)
        {
            if (dbContext == null) return;
            if (await dbContext.Set<ModelType>().AnyAsync()) return;

            var brandModels = new Dictionary<string, List<string>>
            {
                { "تويوتا", new List<string> { "كورولا", "ياريس", "كامري", "أفالون", "RAV4", "لاند كروزر", "برادو", "هايلكس", "فورتشنر", "C-HR", "سوبرا", "أفانزا", "رش" } },
                { "هيونداي", new List<string> { "النترا", "أكسنت", "سوناتا", "أزيرا", "توسان", "سانتافي", "كونا", "باليسيد", "i10", "i20", "i30", "فيراكروز", "كريتا" } },
                { "كيا", new List<string> { "سيراتو", "ريو", "أوبتيما", "K5", "K3", "ستينجر", "سبورتاج", "سورينتو", "تيلورايد", "بيكانتو", "سول", "نيرو", "سيلتوس" } },
                { "شيفروليه", new List<string> { "أوبترا", "لانوس", "افيو", "كروز", "ماليبو", "كابتيفا", "تاهو", "سيلفرادو", "كامارو", "إكوينوكس", "سبارك", "سونيك" } },
                { "نيسان", new List<string> { "صني", "سنترا", "ألتيما", "ماكسيما", "قشقاي", "إكس تريل", "باترول", "تييدا", "جوك", "كيكس", "مورانو", "باثفايندر" } },
                { "ميتسوبيشي", new List<string> { "لانسر", "أتراج", "باجيرو", "أوتلاندر", "إكليبس كروس", "ميراج", "اكسباندر" } },
                { "فورد", new List<string> { "فييستا", "فوكس", "فيوجن", "توروس", "موستانج", "إسكيب", "إكسبلورر", "إكسبيديشن", "F-150", "إيدج", "إيكوسبورت" } },
                { "بي إم دبليو", new List<string> { "الفئة الأولى", "الفئة الثانية", "الفئة الثالثة", "الفئة الرابعة", "الفئة الخامسة", "الفئة السادسة", "الفئة السابعة", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4" } },
                { "مرسيدس", new List<string> { "A-Class", "C-Class", "E-Class", "S-Class", "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "AMG GT" } },
                { "رينو", new List<string> { "لوجان", "سانديرو", "ميجان", "داستر", "كابتشر", "كادجار", "كوليوس", "كليو", "زووي" } },
                { "هوندا", new List<string> { "سيفيك", "أكورد", "CR-V", "HR-V", "بايلوت", "أوديسي", "سيتي", "جاز" } },
                { "أوبل", new List<string> { "استرا", "كورسا", "انسيجنيا", "موكا", "كروس لاند", "جراند لاند", "زافيرا", "كاسكادا" } },
                { "جيلي", new List<string> { "امجراند", "كولراي", "ازكارا", "اكس7", "بينراي", "جي سي6", "توجيلا" } },
                { "سوزوكي", new List<string> { "سويفت", "ألتو", "فيتارا", "ديزاير", "إرتيجا", "بالينو", "سياز", "جيمني", "إسبريسو" } },
                { "بيجو", new List<string> { "208", "301", "508", "2008", "3008", "5008", "بارتنر", "ترافلر" } },
                { "سكودا", new List<string> { "اوكتافيا", "سوبيرب", "سكالا", "كاميك", "كاروك", "كودياك", "فابيا", "رابيد" } },
                { "فولكس فاجن", new List<string> { "جولف", "باسات", "تيجوان", "طوارق", "أرتيون", "جيتا", "بولو", "تي روك", "تيرامونت" } },
                { "جيب", new List<string> { "رانجلر", "شيروكي", "كومباس", "جراند شيروكي", "رينيجيد", "جلاديتور" } },
                { "داسيا", new List<string> { "داستر", "سانديرو", "لوغان", "لودجي" } },
                { "سيات", new List<string> { "ليون", "إبيزا", "أتيكا", "أرونا", "تاراكو" } },
                { "شيري", new List<string> { "تيجو 3", "تيجو 4 برو", "تيجو 7", "تيجو 8", "اريزو 5", "اريزو 6 برو" } },
                { "BYD", new List<string> { "F3", "S5", "L3", "سونج بلس", "دولفين" } },
                { "MG", new List<string> { "MG 5", "MG 6", "ZS", "HS", "RX5", "RX8", "GT" } },
                { "لادا", new List<string> { "جرانتا", "فيستا", "نيفا", "لارجوس" } },
                { "سانج يونج", new List<string> { "كوراندو", "تيفولي", "XLV", "ريكتسون" } },
                { "فاو", new List<string> { "بيستورن T77", "بيستورن B70" } },
                { "بروتون", new List<string> { "بيرسونا", "ساجا", "X70", "X50" } },
                { "سوبارو", new List<string> { "امبريزا", "ليجاسي", "فورستر", "أوتباك", "XV", "WRX" } },
                { "تسلا", new List<string> { "موديل S", "موديل 3", "موديل X", "موديل Y" } },
                { "أودي", new List<string> { "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "e-tron" } },
                { "بورش", new List<string> { "911", "718 كايمن", "718 بوكستر", "كايين", "ماكان", "باناميرا", "تايكان" } },
                { "مازدا", new List<string> { "مازدا 2", "مازda 3", "مازدا 6", "CX-3", "CX-30", "CX-5", "CX-9" } },
                { "كرايسلر", new List<string> { "300", "باسيفيكا", "فويجر" } },
                { "إيسوزو", new List<string> { "ديماكس", "MU-X" } },
                { "سيتروين", new List<string> { "C3", "C4", "C5 إيركروس", "C-Elysée" } },
                { "دايو", new List<string> { "لانوس", "نوبيرا", "ماتيز", "جنترا" } },
                { "فيات", new List<string> { "500", "500X", "تيبو", "بونتو", "دوبلو" } },
                { "رام", new List<string> { "1500", "2500", "TRX" } },
                { "لينكولن", new List<string> { "نافيجيتور", "أفياتور", "كورسير", "نوتيلوس" } },
                { "هامر", new List<string> { "H1", "H2", "H3", "EV" } },
                { "إنفينيتي", new List<string> { "Q50", "Q60", "QX50", "QX55", "QX60", "QX80" } },
                { "أكورا", new List<string> { "ILX", "TLX", "RDX", "MDX", "NSX" } },
                { "بيوك", new List<string> { "إنكور", "إنفيجن", "إنكليف" } },
                { "كاديلاك", new List<string> { "CT4", "CT5", "XT4", "XT5", "XT6", "اسكاليد" } },
                { "دودج", new List<string> { "تشارجر", "تشالنجر", "دورانجو", "هورنيت" } },
                { "فولفو", new List<string> { "S60", "S90", "V60", "V90", "XC40", "XC60", "XC90" } },
                { "ميني", new List<string> { "كوبر", "كلوبمان", "كونتريمان" } },
                { "روفر", new List<string> { "رينج روفر", "رينج روفر سبورت", "رينج روفر فيلار", "رينج روفر إيفوك", "ديسكفري", "ديفندر" } }
            };

            var brands = await dbContext.Set<Brand>().ToListAsync();
            var modelTypes = new List<ModelType>();
            var currentYear = DateTime.Now.Year;
            foreach (var brand in brands)
            {
                if (brandModels.TryGetValue(brand.Name, out var models))
                {
                    foreach (var model in models)
                    {
                        modelTypes.Add(new ModelType
                        {
                            Name = model,
                            Year = currentYear,
                            BrandId = brand.Id
                        });
                    }
                }
                else
                {
                    // إذا لم يوجد موديلات محددة، أضف موديلات عامة بالسنوات
                    for (int i = 0; i < 5; i++)
                    {
                        modelTypes.Add(new ModelType
                        {
                            Name = $"{brand.Name} موديل {currentYear - i}",
                            Year = currentYear - i,
                            BrandId = brand.Id
                        });
                    }
                }
            }
            dbContext.Set<ModelType>().AddRange(modelTypes);
            await dbContext.SaveChangesAsync();
        }
    }
}
