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
    public class NivelesClasesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NivelesClasesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NivelClase>>> GetNivelesClase()
        {
            return await _context.NivelesClase.ToListAsync();
        }

        // GET
        [HttpGet("{id}")]
        public async Task<ActionResult<NivelClase>> GetNivelClase(int id)
        {
            var nivelClase = await _context.NivelesClase.FindAsync(id);

            if (nivelClase == null)
            {
                return NotFound();
            }

            return nivelClase;
        }

        // PUT
        [HttpPut("{id}")]
        public async Task<IActionResult> PutNivelClase(int id, NivelClase nivelClase)
        {
            if (id != nivelClase.Id)
            {
                return BadRequest();
            }

            _context.Entry(nivelClase).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await NivelClaseExistsAsync(id))
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
        public async Task<ActionResult<NivelClase>> PostNivelClase(NivelClase nivelClase)
        {
            _context.NivelesClase.Add(nivelClase);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetNivelClase", new { id = nivelClase.Id }, nivelClase);
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNivelClase(int id)
        {
            var nivelClase = await _context.NivelesClase.FindAsync(id);
            if (nivelClase == null)
            {
                return NotFound();
            }

            _context.NivelesClase.Remove(nivelClase);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private Task<bool> NivelClaseExistsAsync(int id)
        {
            return _context.NivelesClase.AnyAsync(e => e.Id == id);
        }
    }
}
