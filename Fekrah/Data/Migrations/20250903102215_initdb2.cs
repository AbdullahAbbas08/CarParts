using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class initdb2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Parts_ModelTypes_CarModelTypeId",
                table: "Parts");

            migrationBuilder.RenameColumn(
                name: "CarModelTypeId",
                table: "Parts",
                newName: "ModelTypeId");

            migrationBuilder.RenameIndex(
                name: "IX_Parts_CarModelTypeId",
                table: "Parts",
                newName: "IX_Parts_ModelTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_ModelTypes_ModelTypeId",
                table: "Parts",
                column: "ModelTypeId",
                principalTable: "ModelTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Parts_ModelTypes_ModelTypeId",
                table: "Parts");

            migrationBuilder.RenameColumn(
                name: "ModelTypeId",
                table: "Parts",
                newName: "CarModelTypeId");

            migrationBuilder.RenameIndex(
                name: "IX_Parts_ModelTypeId",
                table: "Parts",
                newName: "IX_Parts_CarModelTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Parts_ModelTypes_CarModelTypeId",
                table: "Parts",
                column: "CarModelTypeId",
                principalTable: "ModelTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
