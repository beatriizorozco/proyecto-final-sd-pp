using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CentroHipico.API.Data;
using CentroHipico.API.Models;

namespace CentroHipico.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PistasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PistasController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pista>>> GetPistas()
        {
            return await _context.Pistas.ToListAsync();
        }

        // GET
        [HttpGet("{id}")]
        public async Task<ActionResult<Pista>> GetPista(int id)
        {
            var pista = await _context.Pistas.FindAsync(id);

            if (pista == null)
            {
                return NotFound();
            }

            return pista;
        }

        // PUT
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPista(int id, Pista pista)
        {
            if (id != pista.Id)
            {
                return BadRequest();
            }

            _context.Entry(pista).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await PistaExistsAsync(id))
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
        public async Task<ActionResult<Pista>> PostPista(Pista pista)
        {
            _context.Pistas.Add(pista);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPista", new { id = pista.Id }, pista);
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePista(int id)
        {
            var pista = await _context.Pistas.FindAsync(id);
            if (pista == null)
            {
                return NotFound();
            }

            _context.Pistas.Remove(pista);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private Task<bool> PistaExistsAsync(int id)
        {
            return _context.Pistas.AnyAsync(e => e.Id == id);
        }
    }
}
