"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import type {
  EducationEntry,
  EmploymentStatus,
  ExperienceEntry,
  Profile,
  ProjectEntry,
} from "@/lib/types";
import { EMPLOYMENT_STATUS_LABELS, normalizeJsonArray } from "@/lib/types";

type Props = {
  initial: Profile;
};

export function ProfileForm({ initial }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const incomplete = searchParams.get("incomplete") === "1";

  const [fullName, setFullName] = useState(initial.full_name ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [iqamaNumber, setIqamaNumber] = useState(initial.iqama_number ?? "");
  const [iqamaExpiry, setIqamaExpiry] = useState(
    initial.iqama_expiry?.slice(0, 10) ?? "",
  );
  const [passportNumber, setPassportNumber] = useState(
    initial.passport_number ?? "",
  );
  const [passportExpiry, setPassportExpiry] = useState(
    initial.passport_expiry?.slice(0, 10) ?? "",
  );
  const [employmentStatus, setEmploymentStatus] = useState<
    EmploymentStatus | ""
  >(initial.employment_status ?? "");
  const [currentEmployer, setCurrentEmployer] = useState(
    initial.current_employer ?? "",
  );
  const [currentJobTitle, setCurrentJobTitle] = useState(
    initial.current_job_title ?? "",
  );
  const [yearsExperience, setYearsExperience] = useState(
    initial.years_experience != null ? String(initial.years_experience) : "",
  );
  const [education, setEducation] = useState<EducationEntry[]>(
    normalizeJsonArray<EducationEntry>(initial.education),
  );
  const [experience, setExperience] = useState<ExperienceEntry[]>(
    normalizeJsonArray<ExperienceEntry>(initial.experience),
  );
  const [projects, setProjects] = useState<ProjectEntry[]>(
    normalizeJsonArray<ProjectEntry>(initial.projects),
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        phone,
        iqama_number: iqamaNumber,
        iqama_expiry: iqamaExpiry || null,
        passport_number: passportNumber,
        passport_expiry: passportExpiry || null,
        employment_status: employmentStatus || null,
        current_employer: currentEmployer,
        current_job_title: currentJobTitle,
        years_experience: yearsExperience,
        education,
        experience,
        projects,
      }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(body.error || "Could not save profile");
      return;
    }
    setSaved(true);
    router.refresh();
    if (next) {
      router.push(next);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {incomplete ? (
        <p className="border border-line bg-mist px-3 py-2 text-sm text-teal">
          Complete your profile (name, phone, Iqama number and expiry) before
          applying.
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">
          Contact
        </h2>
        <div>
          <label className="label">Full name *</label>
          <input
            className="input"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input bg-mist" value={initial.email} disabled />
        </div>
        <div>
          <label className="label">Phone *</label>
          <input
            className="input"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">
          Identity (KSA)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Iqama number *</label>
            <input
              className="input"
              required
              value={iqamaNumber}
              onChange={(e) => setIqamaNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Iqama expiry *</label>
            <input
              className="input"
              type="date"
              required
              value={iqamaExpiry}
              onChange={(e) => setIqamaExpiry(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Passport number</label>
            <input
              className="input"
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Passport expiry</label>
            <input
              className="input"
              type="date"
              value={passportExpiry}
              onChange={(e) => setPassportExpiry(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">
          Employment
        </h2>
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={employmentStatus}
            onChange={(e) =>
              setEmploymentStatus(e.target.value as EmploymentStatus | "")
            }
          >
            <option value="">Select…</option>
            {(
              Object.keys(EMPLOYMENT_STATUS_LABELS) as EmploymentStatus[]
            ).map((key) => (
              <option key={key} value={key}>
                {EMPLOYMENT_STATUS_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Current employer</label>
            <input
              className="input"
              value={currentEmployer}
              onChange={(e) => setCurrentEmployer(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Current job title</label>
            <input
              className="input"
              value={currentJobTitle}
              onChange={(e) => setCurrentJobTitle(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label">Years of experience</label>
          <input
            className="input"
            type="number"
            min={0}
            max={60}
            step={0.5}
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
          />
        </div>
      </section>

      <ListSection
        title="Education"
        onAdd={() =>
          setEducation((rows) => [
            ...rows,
            { degree: "", institution: "", year: "", field: "" },
          ])
        }
      >
        {education.map((row, index) => (
          <div key={index} className="space-y-3 border border-line p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="input"
                placeholder="Degree"
                value={row.degree}
                onChange={(e) =>
                  setEducation((rows) =>
                    rows.map((r, i) =>
                      i === index ? { ...r, degree: e.target.value } : r,
                    ),
                  )
                }
              />
              <input
                className="input"
                placeholder="Institution"
                value={row.institution}
                onChange={(e) =>
                  setEducation((rows) =>
                    rows.map((r, i) =>
                      i === index ? { ...r, institution: e.target.value } : r,
                    ),
                  )
                }
              />
              <input
                className="input"
                placeholder="Field"
                value={row.field ?? ""}
                onChange={(e) =>
                  setEducation((rows) =>
                    rows.map((r, i) =>
                      i === index ? { ...r, field: e.target.value } : r,
                    ),
                  )
                }
              />
              <input
                className="input"
                placeholder="Year"
                value={row.year ?? ""}
                onChange={(e) =>
                  setEducation((rows) =>
                    rows.map((r, i) =>
                      i === index ? { ...r, year: e.target.value } : r,
                    ),
                  )
                }
              />
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-teal"
              onClick={() =>
                setEducation((rows) => rows.filter((_, i) => i !== index))
              }
            >
              Remove
            </button>
          </div>
        ))}
      </ListSection>

      <ListSection
        title="Work experience"
        onAdd={() =>
          setExperience((rows) => [
            ...rows,
            {
              company: "",
              title: "",
              start_date: "",
              end_date: "",
              is_current: false,
              description: "",
            },
          ])
        }
      >
        {experience.map((row, index) => (
          <div key={index} className="space-y-3 border border-line p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="input"
                placeholder="Company"
                value={row.company}
                onChange={(e) =>
                  setExperience((rows) =>
                    rows.map((r, i) =>
                      i === index ? { ...r, company: e.target.value } : r,
                    ),
                  )
                }
              />
              <input
                className="input"
                placeholder="Title"
                value={row.title}
                onChange={(e) =>
                  setExperience((rows) =>
                    rows.map((r, i) =>
                      i === index ? { ...r, title: e.target.value } : r,
                    ),
                  )
                }
              />
              <input
                className="input"
                type="month"
                placeholder="Start"
                value={row.start_date ?? ""}
                onChange={(e) =>
                  setExperience((rows) =>
                    rows.map((r, i) =>
                      i === index ? { ...r, start_date: e.target.value } : r,
                    ),
                  )
                }
              />
              <input
                className="input"
                type="month"
                placeholder="End"
                disabled={row.is_current}
                value={row.end_date ?? ""}
                onChange={(e) =>
                  setExperience((rows) =>
                    rows.map((r, i) =>
                      i === index ? { ...r, end_date: e.target.value } : r,
                    ),
                  )
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate">
              <input
                type="checkbox"
                checked={Boolean(row.is_current)}
                onChange={(e) =>
                  setExperience((rows) =>
                    rows.map((r, i) =>
                      i === index
                        ? {
                            ...r,
                            is_current: e.target.checked,
                            end_date: e.target.checked ? "" : r.end_date,
                          }
                        : r,
                    ),
                  )
                }
              />
              Currently working here
            </label>
            <textarea
              className="input min-h-20"
              placeholder="Description"
              value={row.description ?? ""}
              onChange={(e) =>
                setExperience((rows) =>
                  rows.map((r, i) =>
                    i === index ? { ...r, description: e.target.value } : r,
                  ),
                )
              }
            />
            <button
              type="button"
              className="text-xs font-semibold text-teal"
              onClick={() =>
                setExperience((rows) => rows.filter((_, i) => i !== index))
              }
            >
              Remove
            </button>
          </div>
        ))}
      </ListSection>

      <ListSection
        title="Projects"
        onAdd={() =>
          setProjects((rows) => [
            ...rows,
            { name: "", description: "", url: "" },
          ])
        }
      >
        {projects.map((row, index) => (
          <div key={index} className="space-y-3 border border-line p-4">
            <input
              className="input"
              placeholder="Project name"
              value={row.name}
              onChange={(e) =>
                setProjects((rows) =>
                  rows.map((r, i) =>
                    i === index ? { ...r, name: e.target.value } : r,
                  ),
                )
              }
            />
            <input
              className="input"
              placeholder="URL"
              value={row.url ?? ""}
              onChange={(e) =>
                setProjects((rows) =>
                  rows.map((r, i) =>
                    i === index ? { ...r, url: e.target.value } : r,
                  ),
                )
              }
            />
            <textarea
              className="input min-h-20"
              placeholder="Description"
              value={row.description ?? ""}
              onChange={(e) =>
                setProjects((rows) =>
                  rows.map((r, i) =>
                    i === index ? { ...r, description: e.target.value } : r,
                  ),
                )
              }
            />
            <button
              type="button"
              className="text-xs font-semibold text-teal"
              onClick={() =>
                setProjects((rows) => rows.filter((_, i) => i !== index))
              }
            >
              Remove
            </button>
          </div>
        ))}
      </ListSection>

      {error ? <p className="text-sm text-teal">{error}</p> : null}
      {saved && !next ? (
        <p className="text-sm text-teal">Profile saved.</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : next ? "Save and continue" : "Save profile"}
        </button>
        <Link href="/dashboard" className="btn-secondary">
          My applications
        </Link>
      </div>
    </form>
  );
}

function ListSection({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        <button type="button" className="btn-secondary !py-1.5 !text-xs" onClick={onAdd}>
          Add
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
