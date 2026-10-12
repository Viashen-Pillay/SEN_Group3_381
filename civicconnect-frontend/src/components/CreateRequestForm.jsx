import { useState } from "react";
import "../styles/requestForm.css";

const categories = [
  { category_id: 1, name: "Facility Faults" },
  { category_id: 2, name: "IT Support" },
  { category_id: 3, name: "Maintenance" },
  { category_id: 4, name: "Security Concerns" }
];

export function CreateRequestForm({ onRequestCreated }) {
  const [formData, setFormData] = useState({
    category_id: "",
    title: "",
    description: ""
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: ""
    }));

    setSuccess("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = {};

    if (!formData.category_id) {
      validationErrors.category_id = "Please select a category.";
    }

    if (!formData.title.trim()) {
      validationErrors.title = "Please enter a request title.";
    }

    if (formData.description.trim().length < 10) {
      validationErrors.description =
        "Description must contain at least 10 characters.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newRequest = {
      request_id: `mock-${crypto.randomUUID()}`,
      category_id: Number(formData.category_id),
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: "NEW"
    };

    onRequestCreated(newRequest);

    setFormData({
      category_id: "",
      title: "",
      description: ""
    });

    setErrors({});
    setSuccess("Request created in demo mode. It has not been saved to the database.");
  };

  return (
    <div className="request-form-container">
      <div className="request-form-heading">
        <h2>Submit Service Request</h2>
        <p>Describe the issue you would like to report.</p>
      </div>

      <form className="request-form" onSubmit={handleSubmit}>
        {success && (
          <div className="form-success" role="status">
            {success}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="category_id">Category *</label>

          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            aria-invalid={Boolean(errors.category_id)}
          >
            <option value="">Select a category</option>

            {categories.map((category) => (
              <option
                key={category.category_id}
                value={category.category_id}
              >
                {category.name}
              </option>
            ))}
          </select>

          {errors.category_id && (
            <span className="form-error">{errors.category_id}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="title">Request Title *</label>

          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Broken air conditioner"
            maxLength={150}
            aria-invalid={Boolean(errors.title)}
          />

          {errors.title && (
            <span className="form-error">{errors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>

          <textarea
            id="description"
            name="description"
            rows={6}
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide details about the issue..."
            aria-invalid={Boolean(errors.description)}
          />

          {errors.description && (
            <span className="form-error">{errors.description}</span>
          )}
        </div>

        <button className="primary-button" type="submit">
          Submit Request
        </button>
      </form>
    </div>
  );
}