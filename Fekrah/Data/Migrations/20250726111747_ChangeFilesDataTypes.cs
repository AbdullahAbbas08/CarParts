using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class ChangeFilesDataTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_City_Governorate_GovernorateId",
                table: "City");

            migrationBuilder.DropForeignKey(
                name: "FK_Parts_Sellers_SellerId",
                table: "Parts");

            migrationBuilder.DropForeignKey(
                name: "FK_SellerCategories_Sellers_SellerId",
                table: "SellerCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_Sellers_City_CityId",
                table: "Sellers");

            migrationBuilder.DropForeignKey(
                name: "FK_Sellers_Governorate_GovernorateId",
                table: "Sellers");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Sellers_MerchantId",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Sellers",
                table: "Sellers");

            migrationBuilder.RenameTable(
                name: "Sellers",
                newName: "Merchants");

            migrationBuilder.RenameIndex(
                name: "IX_Sellers_GovernorateId",
                table: "Merchants",
                newName: "IX_Merchants_GovernorateId");

            migrationBuilder.RenameIndex(
                name: "IX_Sellers_CityId",
                table: "Merchants",
                newName: "IX_Merchants_CityId");

            migrationBuilder.AlterColumn<int>(
                name: "GovernorateId",
                table: "City",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            // --- تحويل الأعمدة النصية إلى باينري مع الحفاظ على البيانات ---
            migrationBuilder.AddColumn<byte[]>(
                name: "CommercialRegistrationImage_temp",
                table: "Merchants",
                type: "varbinary(max)",
                nullable: true);
            migrationBuilder.AddColumn<byte[]>(
                name: "Logo_temp",
                table: "Merchants",
                type: "varbinary(max)",
                nullable: true);
            migrationBuilder.AddColumn<byte[]>(
                name: "NationalIdImage_temp",
                table: "Merchants",
                type: "varbinary(max)",
                nullable: true);

            migrationBuilder.Sql("UPDATE Merchants SET CommercialRegistrationImage_temp = CONVERT(varbinary(max), CommercialRegistrationImage)");
            migrationBuilder.Sql("UPDATE Merchants SET Logo_temp = CONVERT(varbinary(max), Logo)");
            migrationBuilder.Sql("UPDATE Merchants SET NationalIdImage_temp = CONVERT(varbinary(max), NationalIdImage)");

            migrationBuilder.DropColumn(
                name: "CommercialRegistrationImage",
                table: "Merchants");
            migrationBuilder.DropColumn(
                name: "Logo",
                table: "Merchants");
            migrationBuilder.DropColumn(
                name: "NationalIdImage",
                table: "Merchants");

            migrationBuilder.RenameColumn(
                name: "CommercialRegistrationImage_temp",
                table: "Merchants",
                newName: "CommercialRegistrationImage");
            migrationBuilder.RenameColumn(
                name: "Logo_temp",
                table: "Merchants",
                newName: "Logo");
            migrationBuilder.RenameColumn(
                name: "NationalIdImage_temp",
                table: "Merchants",
                newName: "NationalIdImage");

            migrationBuilder.AlterColumn<byte[]>(
                name: "NationalIdImage",
                table: "Merchants",
                type: "varbinary(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<byte[]>(
                name: "Logo",
                table: "Merchants",
                type: "varbinary(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<byte[]>(
                name: "CommercialRegistrationImage",
                table: "Merchants",
                type: "varbinary(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Merchants",
                table: "Merchants",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_City_Governorate_GovernorateId",
                table: "City",
                column: "GovernorateId",
                principalTable: "Governorate",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Merchants_City_CityId",
                table: "Merchants",
                column: "CityId",
                principalTable: "City",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Merchants_Governorate_GovernorateId",
                table: "Merchants",
                column: "GovernorateId",
                principalTable: "Governorate",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_Merchants_SellerId",
                table: "Parts",
                column: "SellerId",
                principalTable: "Merchants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SellerCategories_Merchants_SellerId",
                table: "SellerCategories",
                column: "SellerId",
                principalTable: "Merchants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Merchants_MerchantId",
                table: "Users",
                column: "MerchantId",
                principalTable: "Merchants",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_City_Governorate_GovernorateId",
                table: "City");

            migrationBuilder.DropForeignKey(
                name: "FK_Merchants_City_CityId",
                table: "Merchants");

            migrationBuilder.DropForeignKey(
                name: "FK_Merchants_Governorate_GovernorateId",
                table: "Merchants");

            migrationBuilder.DropForeignKey(
                name: "FK_Parts_Merchants_SellerId",
                table: "Parts");

            migrationBuilder.DropForeignKey(
                name: "FK_SellerCategories_Merchants_SellerId",
                table: "SellerCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Merchants_MerchantId",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Merchants",
                table: "Merchants");

            migrationBuilder.RenameTable(
                name: "Merchants",
                newName: "Sellers");

            migrationBuilder.RenameIndex(
                name: "IX_Merchants_GovernorateId",
                table: "Sellers",
                newName: "IX_Sellers_GovernorateId");

            migrationBuilder.RenameIndex(
                name: "IX_Merchants_CityId",
                table: "Sellers",
                newName: "IX_Sellers_CityId");

            migrationBuilder.AlterColumn<int>(
                name: "GovernorateId",
                table: "City",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "NationalIdImage",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(byte[]),
                oldType: "varbinary(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Logo",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(byte[]),
                oldType: "varbinary(max)");

            migrationBuilder.AlterColumn<string>(
                name: "CommercialRegistrationImage",
                table: "Sellers",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(byte[]),
                oldType: "varbinary(max)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Sellers",
                table: "Sellers",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_City_Governorate_GovernorateId",
                table: "City",
                column: "GovernorateId",
                principalTable: "Governorate",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_Sellers_SellerId",
                table: "Parts",
                column: "SellerId",
                principalTable: "Sellers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SellerCategories_Sellers_SellerId",
                table: "SellerCategories",
                column: "SellerId",
                principalTable: "Sellers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Sellers_City_CityId",
                table: "Sellers",
                column: "CityId",
                principalTable: "City",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Sellers_Governorate_GovernorateId",
                table: "Sellers",
                column: "GovernorateId",
                principalTable: "Governorate",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Sellers_MerchantId",
                table: "Users",
                column: "MerchantId",
                principalTable: "Sellers",
                principalColumn: "Id");
        }
    }
}
