using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CentroHipico.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPistatoClaseHipica : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PistaId",
                table: "ClasesHipica",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ClasesHipica_PistaId",
                table: "ClasesHipica",
                column: "PistaId");

            migrationBuilder.AddForeignKey(
                name: "FK_ClasesHipica_Pistas_PistaId",
                table: "ClasesHipica",
                column: "PistaId",
                principalTable: "Pistas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClasesHipica_Pistas_PistaId",
                table: "ClasesHipica");

            migrationBuilder.DropIndex(
                name: "IX_ClasesHipica_PistaId",
                table: "ClasesHipica");

            migrationBuilder.DropColumn(
                name: "PistaId",
                table: "ClasesHipica");
        }
    }
}
