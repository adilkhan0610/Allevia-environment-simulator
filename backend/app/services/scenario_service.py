import json
from pathlib import Path
from typing import List, Optional
from app.schemas.scenario import ScenarioMetadata


class ScenarioService:
    def __init__(self, scenarios_dir: Optional[Path] = None):
        if scenarios_dir is None:
            # Check relative to backend root or repository root
            base_dir = Path(__file__).resolve().parent.parent.parent.parent
            self.scenarios_dir = base_dir / "scenarios"
            if not self.scenarios_dir.exists():
                # Fallback to local scenarios folder
                self.scenarios_dir = Path(__file__).resolve().parent.parent.parent / "scenarios"
        else:
            self.scenarios_dir = scenarios_dir

    def get_all_scenarios(self) -> List[ScenarioMetadata]:
        scenarios: List[ScenarioMetadata] = []
        if not self.scenarios_dir.exists():
            return scenarios

        for file_path in sorted(self.scenarios_dir.glob("*.json")):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    scenarios.append(ScenarioMetadata(**data))
            except Exception as e:
                # Log or ignore invalid scenario file
                continue
        return scenarios

    def get_scenario_by_id(self, scenario_id: str) -> Optional[ScenarioMetadata]:
        for scenario in self.get_all_scenarios():
            if scenario.id == scenario_id or scenario.slug == scenario_id:
                return scenario
        return None


scenario_service = ScenarioService()
