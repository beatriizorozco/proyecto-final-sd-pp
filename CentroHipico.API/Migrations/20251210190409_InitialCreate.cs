using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.Blazor;
using System;

#nullable disable

namespace CentroHipico.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Caballos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Edad = table.Column<int>(type: "int", nullable: false),
                    Nivel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EsPropio = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Caballos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Disciplinas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Disciplinas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NivelesClase",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NivelesClase", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Pistas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Activa = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pistas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Jinetes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RolId = table.Column<int>(type: "int", nullable: false),
                    TieneCaballoPropio = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Jinetes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Jinetes_Roles_RolId",
                        column: x => x.RolId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClasesHipica",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Titulo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DisciplinaId = table.Column<int>(type: "int", nullable: false),
                    NivelClaseId = table.Column<int>(type: "int", nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DuracionMinutos = table.Column<int>(type: "int", nullable: false),
                    PlazasMaximas = table.Column<int>(type: "int", nullable: false),
                    MonitorId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClasesHipica", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClasesHipica_Disciplinas_DisciplinaId",
                        column: x => x.DisciplinaId,
                        principalTable: "Disciplinas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClasesHipica_Jinetes_MonitorId",
                        column: x => x.MonitorId,
                        principalTable: "Jinetes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClasesHipica_NivelesClase_NivelClaseId",
                        column: x => x.NivelClaseId,
                        principalTable: "NivelesClase",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReservaPista",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    JineteId = table.Column<int>(type: "int", nullable: false),
                    CaballoId = table.Column<int>(type: "int", nullable: false),
                    PistaId = table.Column<int>(type: "int", nullable: false),
                    Inicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Fin = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReservaPista", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReservaPista_Caballos_CaballoId",
                        column: x => x.CaballoId,
                        principalTable: "Caballos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReservaPista_Jinetes_JineteId",
                        column: x => x.JineteId,
                        principalTable: "Jinetes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReservaPista_Pistas_PistaId",
                        column: x => x.PistaId,
                        principalTable: "Pistas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReservasClase",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClaseHipicaId = table.Column<int>(type: "int", nullable: false),
                    JineteId = table.Column<int>(type: "int", nullable: false),
                    FechaReserva = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReservasClase", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReservasClase_ClasesHipica_ClaseHipicaId",
                        column: x => x.ClaseHipicaId,
                        principalTable: "ClasesHipica",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReservasClase_Jinetes_JineteId",
                        column: x => x.JineteId,
                        principalTable: "Jinetes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);

                });

            migrationBuilder.CreateIndex(
                name: "IX_ClasesHipica_DisciplinaId",
                table: "ClasesHipica",
                column: "DisciplinaId");

            migrationBuilder.CreateIndex(
                name: "IX_ClasesHipica_MonitorId",
                table: "ClasesHipica",
                column: "MonitorId");

            migrationBuilder.CreateIndex(
                name: "IX_ClasesHipica_NivelClaseId",
                table: "ClasesHipica",
                column: "NivelClaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Jinetes_RolId",
                table: "Jinetes",
                column: "RolId");

            migrationBuilder.CreateIndex(
                name: "IX_ReservaPista_CaballoId",
                table: "ReservaPista",
                column: "CaballoId");

            migrationBuilder.CreateIndex(
                name: "IX_ReservaPista_JineteId",
                table: "ReservaPista",
                column: "JineteId");

            migrationBuilder.CreateIndex(
                name: "IX_ReservaPista_PistaId",
                table: "ReservaPista",
                column: "PistaId");

            migrationBuilder.CreateIndex(
                name: "IX_ReservasClase_ClaseHipicaId",
                table: "ReservasClase",
                column: "ClaseHipicaId");

            migrationBuilder.CreateIndex(
                name: "IX_ReservasClase_JineteId",
                table: "ReservasClase",
                column: "JineteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ReservaPista");

            migrationBuilder.DropTable(
                name: "ReservasClase");

            migrationBuilder.DropTable(
                name: "Caballos");

            migrationBuilder.DropTable(
                name: "Pistas");

            migrationBuilder.DropTable(
                name: "ClasesHipica");

            migrationBuilder.DropTable(
                name: "Disciplinas");

            migrationBuilder.DropTable(
                name: "Jinetes");

            migrationBuilder.DropTable(
                name: "NivelesClase");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
