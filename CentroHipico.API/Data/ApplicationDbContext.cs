using CentroHipico.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace CentroHipico.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<Caballo> Caballos { get; set; }
        public DbSet<Jinete> Jinetes { get; set; }
        public DbSet<Rol> Roles { get; set; }
        public DbSet<Disciplina> Disciplinas { get; set; }
        public DbSet<NivelClase> NivelesClase { get; set; }
        public DbSet<ClaseHipica> ClasesHipica { get; set; }
        public DbSet<ReservaClase> ReservasClase { get; set; }
        public DbSet<ReservaPista> ReservasPista { get; set; }
        public DbSet<Pista> Pistas { get; set; }
        public DbSet<ReservaPista> ReservaPista { get; set; }
        public DbSet<Profesor> Profesores { get; set; }

    }
}
