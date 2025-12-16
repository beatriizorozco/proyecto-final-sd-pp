using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CentroHipico.API.Data;
using CentroHipico.API.Models;

namespace CentroHipico.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservaPistaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReservaPistaController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReservaPista>>> GetReservasPista()
        {
            return await _context.ReservasPista
                .Include(r => r.Jinete)
                .Include(r => r.Caballo)
                .Include(r => r.Pista)
                .ToListAsync();
        }

        // GET
        [HttpGet("{id}")]
        public async Task<ActionResult<ReservaPista>> GetReservaPista(int id)
        {
            var reservaPista = await _context.ReservasPista
                .Include(r => r.Jinete)
                .Include(r => r.Caballo)
                .Include(r => r.Pista)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservaPista == null)
            {
                return NotFound();
            }

            return reservaPista;
        }

        // PUT
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReservaPista(int id, ReservaPista reservaPista)
        {
            if (id != reservaPista.Id)
            {
                return BadRequest("El id de la URL no coincide con el de la reserva.");
            }
            var errorValidacion = await ValidarReservaPistaAsync(reservaPista, esActualizacion: true);
            if (errorValidacion != null)
            {
                return BadRequest(errorValidacion);
            }

            _context.Entry(reservaPista).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await ReservaPistaExistsAsync(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST
        [HttpPost]
        public async Task<ActionResult<ReservaPista>> PostReservaPista(ReservaPista reservaPista)
        {
            var errorValidacion = await ValidarReservaPistaAsync(reservaPista);
            if (errorValidacion != null)
            {
                return BadRequest(errorValidacion);
            }

            _context.ReservasPista.Add(reservaPista);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReservaPista), new { id = reservaPista.Id }, reservaPista);
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReservaPista(int id)
        {
            var reservaPista = await _context.ReservasPista.FindAsync(id);
            if (reservaPista == null)
            {
                return NotFound();
            }

            _context.ReservasPista.Remove(reservaPista);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<string?> ValidarReservaPistaAsync(ReservaPista reservaPista, bool esActualizacion = false)
        {
            //Valido quee las fechas sean coherentes
            if (reservaPista.Fin <= reservaPista.Inicio)
            {
                return "La hora de fin debe ser posterior a la hora de inicio.";
            }

            //No se puede hacer reserva de una fecha pasada
            if (reservaPista.Inicio <= DateTime.Now)
            {
                return "La reserva debe ser para una fecha y hora futura.";
            }

            //Duración mínima y máxima permitida
            var duracion = reservaPista.Fin - reservaPista.Inicio;

            if (duracion.TotalMinutes < 30)
            {
                return "La reserva debe ser de al menos 30 minutos.";
            }

            if (duracion.TotalHours > 2)
            {
                return "La reserva no puede ser de más de 2 horas.";
            }

            //Compruebo que el jinete existe
            var jinete = await _context.Jinetes.FindAsync(reservaPista.JineteId);
            if (jinete == null)
            {
                return "El jinete indicado no existe.";
            }

            //Solo jinetes con caballo propio pueden reservar pista
            if (!jinete.TieneCaballoPropio)
            {
                return "Solo los jinetes con caballo propio pueden reservar pista.";
            }

            //Compruebo que el caballo existe
            var caballo = await _context.Caballos.FindAsync(reservaPista.CaballoId);
            if (caballo == null)
            {
                return "El caballo indicado no existe.";
            }

            //Compruebo que la pista existe
            var pista = await _context.Pistas.FindAsync(reservaPista.PistaId);
            if (pista == null)
            {
                return "La pista indicada no existe.";
            }

            //Valido que se pueda reservar en ese horario y no solape con clases ni otras reservas
            var fechaInicio = reservaPista.Inicio;
            var horaInicio = fechaInicio.TimeOfDay;
            bool esFinDeSemana = fechaInicio.DayOfWeek == DayOfWeek.Saturday ||
                                 fechaInicio.DayOfWeek == DayOfWeek.Sunday;

            if (esFinDeSemana)
            {
                // Fines de semana: 15:00–21:00
                if (horaInicio < TimeSpan.FromHours(15) || horaInicio > TimeSpan.FromHours(21))
                {
                    return "Los fines de semana solo se puede reservar pista de 15:00 a 21:00.";
                }
            }
            else
            {
                // Entre semana: 9:00–15:00 o 19:30–21:00
                bool tramo1 = horaInicio >= TimeSpan.FromHours(9) && horaInicio <= TimeSpan.FromHours(15);
                bool tramo2 = horaInicio >= TimeSpan.FromHours(19.5) && horaInicio <= TimeSpan.FromHours(21);

                if (!tramo1 && !tramo2)
                {
                    return "Entre semana solo se puede reservar pista de 9:00 a 15:00 y de 19:30 a 21:00.";
                }
            }

            var queryReservas = _context.ReservasPista.AsQueryable();

            // Si es una actualización de la reserva, la excluyo del solapamiento
            if (esActualizacion)
            {
                queryReservas = queryReservas.Where(r => r.Id != reservaPista.Id);
            }

            bool haySolape = await queryReservas.AnyAsync(r =>
                r.PistaId == reservaPista.PistaId &&
                (
                    (reservaPista.Inicio >= r.Inicio && reservaPista.Inicio < r.Fin) ||    // empieza dentro de otra reserva
                    (reservaPista.Fin > r.Inicio && reservaPista.Fin <= r.Fin) ||          // termina dentro de otra
                    (reservaPista.Inicio <= r.Inicio && reservaPista.Fin >= r.Fin)         // coindicen totalmente
                )
            );

            if (haySolape)
            {
                return "Ya existe una reserva en esa pista para ese intervalo de tiempo.";
            }

            return null;
        }

        private Task<bool> ReservaPistaExistsAsync(int id)
        {
            return _context.ReservasPista.AnyAsync(e => e.Id == id);
        }
    }
}
